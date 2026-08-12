-- 상담 신청 테이블 만들기
-- Supabase 대시보드 → SQL Editor 에서 실행하세요

CREATE TABLE consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,  -- 고유 번호 (자동 생성)
  name TEXT NOT NULL,                             -- 이름
  phone TEXT NOT NULL,                            -- 연락처
  email TEXT NOT NULL,                            -- 이메일
  situation TEXT,                                 -- 현재 상황
  goal TEXT,                                      -- 희망 결과
  status TEXT DEFAULT 'pending',                  -- 처리 상태 (pending / done)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 접수 시간 (자동)
);

-- 보안 설정
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 누구나 폼 제출(insert)은 가능하도록 허용
CREATE POLICY "Anyone can insert" ON consultations
  FOR INSERT WITH CHECK (true);
