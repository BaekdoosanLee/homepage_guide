// Supabase anon key는 RLS로 보호되는 공개용 키라 클라이언트에 그대로 사용합니다.
var SUPABASE_URL = 'https://smivqeepvgoncavcyqfk.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaXZxZWVwdmdvbmNhdmN5cWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMzAyNjgsImV4cCI6MjEwMTkwNjI2OH0.a1HbVI2NtYp5UpHePxmE88jjTporVtXyHGODW08UtD8';
var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var form = document.getElementById('consultationForm');
var submitBtn = document.getElementById('consultation-submit');
var successBox = document.getElementById('consultation-success');
var errorBox = document.getElementById('consultation-error');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  successBox.style.display = 'none';
  errorBox.style.display = 'none';
  submitBtn.disabled = true;

  var { error } = await supabaseClient.from('consultations').insert({
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    situation: form.situation.value,
    goal: form.goal.value,
  });

  submitBtn.disabled = false;

  if (error) {
    console.error(error);
    errorBox.style.display = 'block';
    return;
  }

  successBox.style.display = 'block';
  form.reset();
});
