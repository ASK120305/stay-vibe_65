describe('Simple Backend Tests', () => {
  it('should add 2 + 2 = 4', () => {
    expect(2 + 2).toBe(4)
  })

  it('should check if number is greater than 0', () => {
    expect(5).toBeGreaterThan(0)
  })

  it('should check if string is not empty', () => {
    expect('test').not.toBe('')
  })

  it('should check if array has items', () => {
    const items = ['item1', 'item2']
    expect(items.length).toBeGreaterThan(0)
  })
})
