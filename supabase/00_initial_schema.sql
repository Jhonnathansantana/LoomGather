-- ---------------------------------------------------------
-- 00_initial_schema.sql
--
-- Script to create the initial database schema for LoomGather.
-- Includes tables for profiles, clients, questionnaires,
-- questions, assessments, and answers. Also sets up
-- RLS and a trigger for new user profiles.
-- ---------------------------------------------------------

-- 1. PROFILES TABLE
-- Stores public user data. Linked to auth.users.
-- ---------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamptz NULL,
  full_name text NULL,
  avatar_url text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. CLIENTS TABLE
-- Stores information about client companies.
-- ---------------------------------------------------------
CREATE TABLE public.clients (
  id bigserial NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  contact_person text NULL,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- Row Level Security for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can see all clients." ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients." ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients." ON public.clients FOR UPDATE TO authenticated USING (true);


-- 3. QUESTIONNAIRES TABLE
-- Stores questionnaire templates.
-- ---------------------------------------------------------
CREATE TABLE public.questionnaires (
  id bigserial NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NULL,
  CONSTRAINT questionnaires_pkey PRIMARY KEY (id)
);

-- Row Level Security for questionnaires
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can see all questionnaires." ON public.questionnaires FOR SELECT TO authenticated USING (true);


-- 4. QUESTIONS TABLE
-- Stores questions for each questionnaire.
-- ---------------------------------------------------------
CREATE TABLE public.questions (
  id bigserial NOT NULL,
  questionnaire_id bigint NOT NULL,
  text text NOT NULL,
  type text NOT NULL,
  options jsonb NULL,
  order_index smallint NOT NULL,
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_questionnaire_id_fkey FOREIGN KEY (questionnaire_id) REFERENCES public.questionnaires(id) ON DELETE CASCADE
);

-- Row Level Security for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can see all questions." ON public.questions FOR SELECT TO authenticated USING (true);


-- 5. ASSESSMENTS TABLE
-- Represents an instance of a consultant assessing a client.
-- ---------------------------------------------------------
CREATE TABLE public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  client_id bigint NOT NULL,
  consultant_id uuid NOT NULL,
  questionnaire_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'in_progress'::text,
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT assessments_consultant_id_fkey FOREIGN KEY (consultant_id) REFERENCES public.profiles(id),
  CONSTRAINT assessments_questionnaire_id_fkey FOREIGN KEY (questionnaire_id) REFERENCES public.questionnaires(id)
);

-- Row Level Security for assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Consultants can see their own assessments." ON public.assessments FOR SELECT USING (auth.uid() = consultant_id);
CREATE POLICY "Consultants can create assessments for themselves." ON public.assessments FOR INSERT WITH CHECK (auth.uid() = consultant_id);
CREATE POLICY "Consultants can update their own assessments." ON public.assessments FOR UPDATE USING (auth.uid() = consultant_id);


-- 6. ANSWERS TABLE
-- Stores answers for each assessment.
-- ---------------------------------------------------------
CREATE TABLE public.answers (
  id bigserial NOT NULL,
  assessment_id uuid NOT NULL,
  question_id bigint NOT NULL,
  value text NULL,
  CONSTRAINT answers_pkey PRIMARY KEY (id),
  CONSTRAINT answers_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE,
  CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);

-- Row Level Security for answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Consultants can view answers to their own assessments." ON public.answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = answers.assessment_id AND assessments.consultant_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can insert/update answers to their own assessments." ON public.answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = answers.assessment_id AND assessments.consultant_id = auth.uid()
    )
  );

-- Insert initial data for the first questionnaire
INSERT INTO public.questionnaires (title, description) VALUES ('Cuestionario de Infraestructura V1', 'Evaluación inicial de la infraestructura tecnológica del cliente.');

INSERT INTO public.questions (questionnaire_id, text, type, options, order_index) VALUES
(1, '¿Cuál es el proveedor de servicios en la nube principal?', 'single_choice', '["AWS", "Azure", "GCP", "On-premise", "Otro"]', 1),
(1, 'Número aproximado de servidores (físicos o virtuales)', 'number', null, 2),
(1, '¿Utilizan algún sistema de orquestación de contenedores?', 'single_choice', '["Kubernetes", "Docker Swarm", "OpenShift", "Ninguno", "Otro"]', 3),
(1, 'Describa brevemente la arquitectura de red actual.', 'text', null, 4),
(1, '¿Qué sistema de monitoreo tienen implementado?', 'text', null, 5);

-- End of script
