-- 상담 신청(consultations) 테이블에 INSERT 발생 시
-- send-consultation-email Edge Function을 자동 호출하는 웹훅(트리거)
-- Supabase 대시보드 → SQL Editor 에서 실행하세요

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_consultation_email()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://smivqeepvgoncavcyqfk.supabase.co/functions/v1/send-consultation-email',
    headers := '{"Content-Type": "application/json", "x-webhook-secret": "EmvrP8m6paocCfQHonnNsMpP58gqG0ZS"}'::jsonb,
    body := jsonb_build_object('type', 'INSERT', 'table', 'consultations', 'record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS consultation_email_webhook ON public.consultations;

CREATE TRIGGER consultation_email_webhook
AFTER INSERT ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.notify_consultation_email();
