-- Add prerequisite system to achievements
ALTER TABLE public.achievements
ADD COLUMN prerequisite_id uuid REFERENCES public.achievements(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_achievements_prerequisite ON public.achievements(prerequisite_id);