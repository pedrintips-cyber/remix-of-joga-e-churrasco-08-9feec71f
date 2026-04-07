
CREATE TABLE public.custom_kit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Carnes',
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  unit TEXT NOT NULL DEFAULT 'un',
  max_quantity INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active custom kit items" ON public.custom_kit_items
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can do everything with custom kit items" ON public.custom_kit_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
