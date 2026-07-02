@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --gold: #B8963E;
  --gold-light: #F5EDD6;
  --gold-dark: #7A6128;
}

body {
  background: #FAFAF7;
  color: #1A1A1A;
}

.gold-btn {
  background: var(--gold);
  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
  width: 100%;
}
.gold-btn:hover { background: var(--gold-dark); }
.gold-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.outline-btn {
  background: white;
  color: #4A4A4A;
  font-weight: 500;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid #E0D8C8;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.outline-btn:hover { border-color: var(--gold); color: var(--gold-dark); }
.outline-btn:disabled { opacity: 0.5; cursor: not-allowed; }

input, select, textarea {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  border: 1px solid #E0D8C8;
  border-radius: 8px;
  background: white;
  color: #1A1A1A;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
  -webkit-appearance: none;
}
input:focus, select:focus, textarea:focus { border-color: var(--gold); }
textarea { resize: vertical; line-height: 1.6; }

.field { margin-bottom: 1rem; }
.field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #4A4A4A;
  margin-bottom: 4px;
}
.field .hint {
  font-size: 11px;
  color: #7A7A7A;
  margin-bottom: 5px;
  line-height: 1.5;
}
.req { color: #C0392B; margin-left: 2px; }
