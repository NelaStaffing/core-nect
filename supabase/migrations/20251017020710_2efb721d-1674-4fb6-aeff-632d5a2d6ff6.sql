-- Create employee requests table
CREATE TABLE public.employee_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick_day', 'free_day', 'meeting', 'suggestion', 'paperwork')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  required_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements tracking table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  category TEXT,
  image_url TEXT,
  stock_quantity INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward redemptions table
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_requests
CREATE POLICY "Users can view own requests"
ON public.employee_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests"
ON public.employee_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Company admins can view all requests"
ON public.employee_requests FOR SELECT
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Company admins can update requests"
ON public.employee_requests FOR UPDATE
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for achievements
CREATE POLICY "Everyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Company admins can manage achievements"
ON public.achievements FOR ALL
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress"
ON public.user_achievements FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Company admins can view all user achievements"
ON public.user_achievements FOR SELECT
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for rewards
CREATE POLICY "Everyone can view active rewards"
ON public.rewards FOR SELECT
USING (active = true);

CREATE POLICY "Company admins can manage rewards"
ON public.rewards FOR ALL
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view own redemptions"
ON public.reward_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions"
ON public.reward_redemptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Company admins can view all redemptions"
ON public.reward_redemptions FOR SELECT
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Company admins can update redemptions"
ON public.reward_redemptions FOR UPDATE
USING (has_role(auth.uid(), 'company') OR has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_employee_requests_updated_at
BEFORE UPDATE ON public.employee_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
BEFORE UPDATE ON public.rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();