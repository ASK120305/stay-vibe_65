import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  login: () => {},
  logout: () => {},
  loading: false,
}

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
