const fs = require('fs');
let content = fs.readFileSync('src/components/Customer/ClientTestimonial.jsx', 'utf8');

content = content.replace("import SEOFooter from '../common/SEOFooter';", 
import SEOFooter from '../common/SEOFooter';
import downloadImg from '../../assets/ClientTestimonial/download.jpg';
import img1 from '../../assets/ClientTestimonial/img1.jpg';
import img2 from '../../assets/ClientTestimonial/img2.jpg';
import img3 from '../../assets/ClientTestimonial/img3.jpg';
import img4 from '../../assets/ClientTestimonial/img4.jpg';);

const imageArray = ['img1', 'img2', 'img3', 'img4'];
content = content.replace(/id: (\d+),/g, (match, id) => {
    const idx = (parseInt(id) - 1) % 4;
    return match + '\n    image: ' + imageArray[idx] + ',';
});

content = content.replace(/<div className=\{\h-16 sm:h-28 flex flex-col items-center justify-center text-center p-3 sm:p-6 \$\{getHeaderStyle\(item\.bgType\)\}\\}>[\s\S]*?<\/div>\s*<\/div>/g, 
<div className="h-28 sm:h-40 w-full overflow-hidden shrink-0">
                  <img src={item.image} alt={item.logoText} className="w-full h-full object-cover" />
                </div>);

content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-1512941937669-90a1b58e7e9c\?auto=format&fit=crop&q=80&w=400"/g, '{downloadImg}');
content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-1596558450268-9c2a420622a5\?auto=format&fit=crop&q=80&w=400"/g, '{downloadImg}');
content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-1551650975-87deedd944c3\?auto=format&fit=crop&q=80&w=400"/g, '{downloadImg}');

fs.writeFileSync('src/components/Customer/ClientTestimonial.jsx', content);
