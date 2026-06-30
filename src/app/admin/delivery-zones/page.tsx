import type { Metadata } from 'next'
import { getAllDeliveryZones } from '@/actions/delivery-zones'
import { DeliveryZonesClient } from '@/components/admin/DeliveryZonesClient'

export const metadata: Metadata = { title: 'Delivery Zones' }

export default async function AdminDeliveryZonesPage() {
  const zones = await getAllDeliveryZones()
  return <DeliveryZonesClient initialZones={zones} />
}
