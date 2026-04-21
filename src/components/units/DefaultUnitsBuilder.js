export function buildDefaultUnits(count, existingCount) {
  return Array.from({ length: count }, (_, i) => {
    const unitNum = existingCount + i + 1
    return {
      _unitNum: unitNum,
      title: `Unit ${unitNum} - `,
      topics: [{ title: '' }],
    }
  })
}
