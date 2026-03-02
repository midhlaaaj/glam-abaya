const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/AdminProducts.jsx',
  'src/pages/admin/AdminCategories.jsx',
  'src/pages/admin/AdminSales.jsx',
  'src/pages/admin/AdminHero.jsx',
  'src/pages/admin/AdminInfluencers.jsx',
  'src/pages/admin/AdminUsers.jsx',
  'src/pages/customer/Shop.jsx',
  'src/pages/customer/Home.jsx',
  'src/pages/customer/ProductDetails.jsx'
];

files.forEach(file => {
  const p = path.join('c:/Users/midhl/Downloads/Web Dev portfolio/Glam/frontend', file);
  if (!fs.existsSync(p)) {
      console.log('Not found:', p);
      return;
  }
  let content = fs.readFileSync(p, 'utf8');
  
  // Remove await supabase.auth.getSession()
  content = content.replace(/\s*\/\/\s*Force token refresh.*?\n\s*await supabase\.auth\.getSession\(\);/g, '');
  content = content.replace(/\s*await supabase\.auth\.getSession\(\);/g, '');

  // Remove focus listeners
  content = content.replace(/\s*const handleFocus\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};\s*/g, '\n');
  content = content.replace(/\s*window\.addEventListener\('focus',\s*[^\)]+\);/g, '');
  content = content.replace(/\s*window\.removeEventListener\('focus',\s*[^\)]+\);/g, '');

  fs.writeFileSync(p, content);
  console.log('Fixed', file);
});
