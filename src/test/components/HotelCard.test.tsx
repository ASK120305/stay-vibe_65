import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HotelCard } from '../../components/hotels/HotelCard'

const mockHotel = {
  _id: '1',
  name: 'Test Hotel',
  location: 'Test City',
  price: 100,
  rating: 4.5,
  image: '/test-image.jpg',
  amenities: ['WiFi', 'Pool'],
  description: 'A test hotel',
}

describe('HotelCard', () => {
  it('renders hotel information correctly', () => {
    render(<HotelCard hotel={mockHotel} />)
    
    expect(screen.getByText('Test Hotel')).toBeInTheDocument()
    expect(screen.getByText('Test City')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('displays hotel image', () => {
    render(<HotelCard hotel={mockHotel} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Test Hotel')
  })
})
