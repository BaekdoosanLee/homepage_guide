-- 관리자 페이지용 조회/수정 정책
-- bdslee72@gmail.com 계정으로 로그인한 사용자만 상담 신청 데이터를 조회/수정할 수 있습니다.

CREATE POLICY "Admin can select" ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'bdslee72@gmail.com');

CREATE POLICY "Admin can update status" ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'bdslee72@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'bdslee72@gmail.com');
