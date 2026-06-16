-- Dorm2Dorm Supabase Schema Migration

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '🦊',
    wing TEXT NOT NULL,
    room TEXT,
    referral_code TEXT UNIQUE,
    bonus_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Listings (Marketplace Items) Table
CREATE TABLE IF NOT EXISTS listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'Other',
    condition TEXT DEFAULT 'Used',
    listing_type TEXT DEFAULT 'Sell',
    rent_duration TEXT,
    security_deposit NUMERIC,
    expiration_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Transactions (Waitlists & Rentals) Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL, -- 'Purchase' or 'Rental'
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed', 'Returned'
    agreed_price NUMERIC,
    token_paid NUMERIC DEFAULT 0,
    security_deposit_held NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Can be tweaked later)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Listings are viewable by everyone." ON listings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own listings." ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings." ON listings FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Transactions are viewable by parties involved." ON transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM listings WHERE id = listing_id));
CREATE POLICY "Users can insert their own transactions." ON transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Parties involved can update transactions." ON transactions FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM listings WHERE id = listing_id));
