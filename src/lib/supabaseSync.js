import { supabase, isSupabaseConfigured } from './supabase';

export function mapDbOrderToApp(dbOrder) {
  if (!dbOrder) return null;
  return {
    id: dbOrder.id,
    buyerName: dbOrder.buyer_name,
    email: dbOrder.email,
    whatsapp: dbOrder.whatsapp,
    tierId: dbOrder.tier_id,
    tierName: dbOrder.tier_name,
    qty: Number(dbOrder.qty),
    unitPrice: Number(dbOrder.unit_price),
    uniqueCode: Number(dbOrder.unique_code),
    totalAmount: Number(dbOrder.total_amount),
    status: dbOrder.status,
    paymentMethod: dbOrder.payment_method || 'transfer',
    receiptUrl: dbOrder.receipt_url,
    ticketId: dbOrder.ticket_id,
    checkedIn: Boolean(dbOrder.checked_in),
    checkedInAt: dbOrder.checked_in_at,
    timestamp: dbOrder.created_at,
  };
}

export function mapDbTierToApp(dbTier) {
  if (!dbTier) return null;
  return {
    id: dbTier.id,
    eventId: dbTier.event_id,
    name: dbTier.name,
    price: Number(dbTier.price),
    quota: Number(dbTier.quota),
    sold: Number(dbTier.sold || 0),
    description: dbTier.description,
    color: dbTier.color || '#22c55e',
  };
}

export function mapDbEventToApp(dbEvent, dbTiers = []) {
  if (!dbEvent) return null;
  const tiers = dbTiers.map(mapDbTierToApp);
  const prices = tiers.map((t) => t.price);
  const minPrice = prices.length ? Math.min(...prices) : Number(dbEvent.price_from || 0);

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    subtitle: dbEvent.subtitle,
    category: dbEvent.category || 'Konser',
    date: dbEvent.date,
    endDate: dbEvent.end_date,
    location: dbEvent.location,
    address: dbEvent.address,
    description: dbEvent.description,
    lineup: dbEvent.lineup || [],
    organizer: dbEvent.organizer,
    priceFrom: minPrice,
    rating: dbEvent.rating || '4.9',
    badge: dbEvent.badge,
    posterUrl: dbEvent.poster_url,
    isActive: dbEvent.is_active !== false,
    tiers,
  };
}

export async function fetchSupabaseState() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [eventsRes, tiersRes, ordersRes] = await Promise.all([
      supabase.from('events').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('event_tiers').select('*').order('price', { ascending: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);

    if (eventsRes.error || tiersRes.error || ordersRes.error) {
      console.warn('Supabase fetch warning:', eventsRes.error || tiersRes.error || ordersRes.error);
      return null;
    }

    const allTiers = tiersRes.data || [];
    const events = (eventsRes.data || []).map((dbEvent) => {
      const eventTiers = allTiers.filter((t) => t.event_id === dbEvent.id);
      return mapDbEventToApp(dbEvent, eventTiers);
    });

    const orders = (ordersRes.data || []).map(mapDbOrderToApp);
    const event = events.find((e) => e.id === 'evt-001') || events[0] || null;

    return { events, event, orders };
  } catch (err) {
    console.error('Error fetching Supabase state:', err);
    return null;
  }
}

export async function createOrderInSupabase(payload) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { id, buyerName, email, whatsapp, tierId, qty, paymentMethod } = payload;
  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_order_id: id,
    p_buyer_name: buyerName,
    p_email: email,
    p_whatsapp: whatsapp,
    p_tier_id: tierId,
    p_qty: qty,
    p_payment_method: paymentMethod || 'transfer',
  });

  if (error) {
    console.error('Supabase create_order_atomic error:', error);
    throw error;
  }
  return mapDbOrderToApp(data);
}

export async function approveOrderInSupabase(orderId) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc('approve_order_atomic', {
    p_order_id: orderId,
  });

  if (error) {
    console.error('Supabase approve_order_atomic error:', error);
    throw error;
  }
  return mapDbOrderToApp(data);
}

export async function releaseOrderInSupabase(orderId, nextStatus) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc('release_order_atomic', {
    p_order_id: orderId,
    p_next_status: nextStatus,
  });

  if (error) {
    console.error('Supabase release_order_atomic error:', error);
    throw error;
  }
  return mapDbOrderToApp(data);
}

export async function checkInTicketInSupabase(ticketId) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc('checkin_ticket_atomic', {
    p_ticket_id: ticketId,
  });

  if (error) {
    console.error('Supabase checkin_ticket_atomic error:', error);
    throw error;
  }
  return data;
}

export async function uploadReceiptToSupabase(orderId, fileOrBase64) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    let fileToUpload = fileOrBase64;
    let fileName = `receipt-${orderId}-${Date.now()}`;

    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
      const parts = fileOrBase64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const byteCharacters = atob(parts[1]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      fileToUpload = new Blob(byteArrays, { type: contentType });
      fileName += contentType.includes('png') ? '.png' : '.jpg';
    } else if (fileOrBase64 instanceof File) {
      fileName += `-${fileOrBase64.name}`;
    }

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    // Update order with receipt_url
    const { error: updateError } = await supabase
      .from('orders')
      .update({ receipt_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (err) {
    console.error('Error uploading receipt to Supabase:', err);
    throw err;
  }
}

export async function createEventInSupabase(eventData) {
  if (!isSupabaseConfigured || !supabase) return null;

  const dbEvent = {
    id: eventData.id || `evt-${Date.now().toString().slice(-4)}`,
    title: eventData.title,
    subtitle: eventData.subtitle || '',
    category: eventData.category || 'Konser',
    date: eventData.date,
    end_date: eventData.endDate || eventData.date,
    location: eventData.location,
    address: eventData.address || '',
    description: eventData.description || '',
    lineup: eventData.lineup || [],
    organizer: eventData.organizer || 'Karcix Event',
    is_active: true,
  };

  const { data: createdEvent, error: eventError } = await supabase
    .from('events')
    .insert([dbEvent])
    .select()
    .single();

  if (eventError) {
    console.error('Error inserting event in Supabase:', eventError);
    throw eventError;
  }

  // Insert tiers if provided
  if (eventData.tiers && eventData.tiers.length > 0) {
    const dbTiers = eventData.tiers.map((t, idx) => ({
      id: t.id || `tier-${createdEvent.id}-${idx + 1}`,
      event_id: createdEvent.id,
      name: t.name,
      price: t.price,
      quota: t.quota,
      sold: 0,
      description: t.description || '',
      color: t.color || '#3b82f6',
    }));

    const { error: tiersError } = await supabase.from('event_tiers').insert(dbTiers);
    if (tiersError) {
      console.error('Error inserting tiers in Supabase:', tiersError);
    }
  }

  return createdEvent;
}

export async function updateEventInSupabase(eventId, updates) {
  if (!isSupabaseConfigured || !supabase) return;

  const dbUpdates = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.organizer !== undefined) dbUpdates.organizer = updates.organizer;

  const { error } = await supabase.from('events').update(dbUpdates).eq('id', eventId);
  if (error) console.error('Error updating event in Supabase:', error);
}

export async function deleteEventInSupabase(eventId) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('event_tiers').delete().eq('event_id', eventId);
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting event in Supabase:', err);
  }
}

export async function updateTierInSupabase(tierId, updates) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.from('event_tiers').update(updates).eq('id', tierId);
  if (error) console.error('Error updating tier in Supabase:', error);
}

export async function fetchCustomersFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching customers from Supabase:', err);
    return null;
  }
}

export async function createCustomerInSupabase(customer) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error inserting customer in Supabase:', err);
    throw err;
  }
}

export async function updateCustomerInSupabase(customerId, updates) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', customerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating customer in Supabase:', err);
    throw err;
  }
}

export async function deleteCustomerInSupabase(customerId) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting customer from Supabase:', err);
  }
}
