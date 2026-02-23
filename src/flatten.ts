interface FlatSimpleCase {
  description: string;
  property: string;
  sides: [number, number, number];
  expected: string;
}

function flattenSimple(cases: (OriginalTestCase | TestGroup)[]): FlatSimpleCase[] {
  const result: FlatSimpleCase[] = [];

  function recurse(items: (OriginalTestCase | TestGroup)[]) {
    for (const item of items) {
      if ('cases' in item) {
        recurse((item as TestGroup).cases);
      } else {
        const tc = item as OriginalTestCase;
        result.push({
          description: tc.description,
          property: tc.property,
          sides: tc.input.sides,
          expected: tc.expected
        });
      }
    }
  }

  recurse(cases);
  return result;
}

// Usage:
// const flat = flattenSimple(data.cases);