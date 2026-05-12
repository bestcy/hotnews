const sources = require("../sources");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isHttpUrl(value) {
  return /^https?:\/\//.test(String(value || ""));
}

function validateCardShape(sourceName, card) {
  assert(card && typeof card === "object", `${sourceName}: missing card object`);
  assert(typeof card.platform === "string" && card.platform.length > 0, `${sourceName}: missing platform`);
  assert(typeof card.category === "string" && card.category.length > 0, `${sourceName}: missing category`);
  assert(Array.isArray(card.items), `${sourceName}: items must be an array`);
  assert(card.items.length >= 5, `${sourceName}: expected at least 5 items, got ${card.items.length}`);

  card.items.slice(0, 5).forEach((item, index) => {
    assert(item && typeof item === "object", `${sourceName}: item ${index + 1} missing`);
    assert(typeof item.title === "string" && item.title.trim().length >= 8, `${sourceName}: item ${index + 1} title too short`);
    assert(typeof item.href === "string" && isHttpUrl(item.href), `${sourceName}: item ${index + 1} href invalid`);
  });
}

async function run() {
  const failures = [];

  for (const source of sources) {
    const startedAt = Date.now();
    try {
      const card = await source.scrape();
      validateCardShape(source.name, card);
      const elapsed = Date.now() - startedAt;
      console.log(`PASS ${source.name} ${card.platform} (${card.items.length} items, ${elapsed}ms)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ source: source.name, message });
      console.error(`FAIL ${source.name} ${message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} source check(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${sources.length} sources passed.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
