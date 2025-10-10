import { describe, it, expect } from 'vitest'

describe('Simple Math Tests', () => {
  it('should add 1 + 1 = 2', () => {
    expect(1 + 1).toBe(2)
  })

  it('should multiply 2 * 3 = 6', () => {
    expect(2 * 3).toBe(6)
  })

  it('should check if string contains text', () => {
    expect('Hello World').toContain('World')
  })
})
