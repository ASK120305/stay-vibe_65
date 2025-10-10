import { describe, it, expect } from 'vitest'

describe('Simple Component Tests', () => {
  it('should check basic math', () => {
    expect(5 + 5).toBe(10)
  })

  it('should check string length', () => {
    expect('Hello'.length).toBe(5)
  })

  it('should check array length', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
  })
})
