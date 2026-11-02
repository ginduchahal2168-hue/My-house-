import { PropertyCategory } from '../types/rental';

/**
 * RentEasy - Clean Static Taxonomies & Metadata
 * Strictly NO fake properties, fake owners, fake prices, or fake counts.
 * Only real user-submitted listings are saved and displayed.
 */

export const CATEGORIES_METADATA: {
  name: PropertyCategory;
  description: string;
  iconName: string;
}[] = [
  { name: 'Single Rooms', description: 'Private bedrooms in shared flats & homes', iconName: 'BedSingle' },
  { name: 'Shared Rooms', description: 'Twin-sharing and student rooms', iconName: 'Users' },
  { name: 'Studio Apartments', description: 'Self-contained open-plan spaces', iconName: 'LayoutGrid' },
  { name: '1 BHK', description: 'One bedroom, hall & kitchen flats', iconName: 'Home' },
  { name: '2 BHK', description: 'Two bedroom homes', iconName: 'Building2' },
  { name: '3 BHK', description: 'Three bedroom family residences', iconName: 'Building' },
  { name: '4 BHK', description: 'Large executive homes and penthouses', iconName: 'Layers' },
  { name: 'Houses', description: 'Detached homes and townhouses', iconName: 'Castle' },
  { name: 'Apartments', description: 'Residential condominiums', iconName: 'Hotel' },
  { name: 'Villas', description: 'Independent villas with private gardens', iconName: 'Palmtree' },
  { name: 'PG Accommodation', description: 'Paying guest stays with boarding', iconName: 'Coffee' },
  { name: 'Hostels', description: 'Dormitory and shared youth lodging', iconName: 'Compass' },
  { name: 'Shops', description: 'Street and retail commercial units', iconName: 'Store' },
  { name: 'Offices', description: 'Commercial office and desk spaces', iconName: 'Briefcase' },
  { name: 'Commercial Properties', description: 'Warehouses, industrial and commercial buildings', iconName: 'Warehouse' },
];
export const ALL_AMENITIES_LIST = [
  'High-Speed Fiber WiFi',
  'Air Conditioning',
  'Central Heating',
  'Private Swimming Pool',
  'Equipped Gym / Fitness Center',
  '24/7 Security & CCTV',
  'Power Backup / Generator',
  'Elevator / Lift',
  'Private Balcony / Terrace',
  'In-Unit Washing Machine',
  'Dishwasher',
  'Covered Reserved Parking',
  'Modular Kitchen',
  'Pet Friendly',
  'Garden / Lawn',
  'Water Purifier / Kaveri Water',
  'Geyser / Hot Water',
  'Gated Community',
  'Intercom Facility',
  'Furnished Living Space'
];
