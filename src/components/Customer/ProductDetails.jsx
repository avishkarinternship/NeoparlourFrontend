import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  Menu, 
  UserPlus, 
  LogIn, 
  Plus, 
  Minus,
  ArrowRight,
  Star
} from 'lucide-react';

// Importing your local assets
import productOne from '../../assets/Customer/ProductSearch/product_one.jpg';
import productTwo from '../../assets/Customer/ProductSearch/product_two.jpg';
import productThree from '../../assets/Customer/ProductSearch/product_three.jpg';
import productFour from '../../assets/Customer/ProductSearch/product_four.jpg';
import productFive from '../../assets/Customer/ProductSearch/product_five.jpg';
import productSix from '../../assets/Customer/ProductSearch/product_five.jpg';

const ProductDetails = () => {
  const navigate = useNavigate();
  // State Management Hooks
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50ml');
  
  // Reference hook to target the horizontal slider DOM node
  const carouselRef = useRef(null);

  const productSizes = ['50ml', '100ml', '250ml'];

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Programmatic pagination control shift right operations trigger
  const handleScrollRight = () => {
    if (carouselRef.current) {
      // Scrolls right smoothly by a full card width index segment
      carouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Related Products Mock Data Block with local images integrated
  const relatedProducts = [
    { id: 1, name: "Necessaire", size: "100ml", price: "₹ 470.00", rating: "4.6", image: productOne },
    { id: 2, name: "Ecocradle Complete Care Hair Serum", size: "50ml", price: "₹ 500.00", rating: "4.6", image: productTwo },
    { id: 3, name: "Hyphen 18% Brightening + 20% Collagen Face Serum", size: "50ml", price: "₹ 500.00", rating: "4.6", image: productThree },
    { id: 4, name: "wiss Beauty Cream It Up Blush", size: "50ml", price: "₹ 225.00", rating: "4.6", image: productFour },
    { id: 5, name: "Fixer Spray for Face makeup", size: "50ml", price: "₹ 236.00", rating: "4.6", image: productFive },
    { id: 6, name: "Fixer Spray for Face makeup", size: "50ml", price: "₹ 236.00", rating: "4.6", image: productSix },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between text-[#131313] antialiased">
      
      {/* --- PLATFORM MASTER HEADER --- */}
      <header className="w-full border-b border-[#E8E8E8] px-4 md:px-12 py-4 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
        {/* Brand Vector Identity Block */}
        <div className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
          <div className="text-[#EF3E23] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M50.8159 0.709961C51.5247 5.9279 50.2046 10.2438 46.635 13.6787C42.6288 17.5384 38.4736 21.2409 34.4058 25.0377C33.8973 25.5096 33.6303 25.5411 33.1526 25.0167C31.9918 23.7423 30.8002 22.4994 29.5573 21.3143C28.9769 20.7584 29.0797 20.4699 29.619 19.9822C36.0392 14.1665 42.4388 8.32455 48.8435 2.4878C49.4393 1.94765 50.0352 1.41793 50.821 0.71521L50.8159 0.709961Z" fill="#878787"/>
              <path fillRule="evenodd" clip-rule="evenodd" d="M45.0678 28.0037C41.2002 25.6019 36.5264 25.6071 32.7513 27.9932C25.3244 20.4993 17.9181 12.995 10.5272 5.46437C8.79117 3.6866 7.13224 1.83021 5.43217 0C5.16509 0.298917 5.08808 0.340875 5.07781 0.398561C4.24062 5.39624 4.98529 9.97435 8.60628 13.7344C10.5015 15.701 12.479 17.5889 14.4101 19.5187C17.0347 22.1303 19.6593 24.7419 22.2839 27.3535C25.2423 30.6783 27.9747 33.7461 30.8201 36.9398C31.1642 36.085 31.3697 35.4819 31.6368 34.9155C33.5783 30.8513 38.4268 29.1418 42.4124 31.1031C45.2989 32.5243 47.1582 35.5921 46.9065 38.791C46.6446 42.1577 44.9343 44.6225 41.7961 45.8391C38.5655 47.0872 35.5146 46.4737 33.1519 43.9145C29.0327 39.457 25.0934 34.8265 21.0256 30.3165C18.3702 27.364 14.9802 25.927 11.0305 26.2994C5.66839 26.8081 1.59038 30.458 0.337159 35.571C-0.859562 40.4533 1.19996 45.6871 5.39619 48.4141C9.84409 51.3088 15.119 51.1304 19.4847 47.7794C20.5839 46.9299 21.3132 46.7569 22.0374 48.0103C22.0374 48.3207 26.3312 50.5694 29.3512 50.2285C26.1463 46.6048 23.1724 43.2486 20.0959 39.7612C19.7518 40.637 19.5514 41.2558 19.2741 42.1031C17.3531 45.7657 12.8847 47.4386 8.87851 45.7447C5.05208 44.1243 3.09517 39.6668 4.47165 35.6917C6.44907 29.9442 13.8144 28.4233 18.0209 32.9909C22.0887 37.4013 25.946 42.0057 29.9984 46.4318C33.229 50.9611 37.2917 51.1881 41.9348 49.9924C46.7679 48.7496 50.3323 44.7326 50.8356 39.9499C51.3749 34.8159 49.4746 30.7359 45.0729 28.0037H45.0678ZM27.1375 28.6645C26.362 28.7432 25.6121 27.9776 25.5915 27.1647C25.5813 26.3729 26.3208 25.6176 27.0964 25.6281C27.8874 25.6386 28.6424 26.399 28.5757 27.1909C28.5038 28.0666 27.9799 28.5806 27.1375 28.6645Z" fill="#EF3E23"/>
            </svg>
          </div>
          <span className="text-[24px] font-bold tracking-tight text-[#242424]">NeoParlour</span>
        </div>

        {/* Global Hub Navigation Search & Filter Bar Group */}
        <div className="hidden lg:flex items-center border border-[#909090] rounded-lg overflow-hidden max-w-2xl w-full mx-6 bg-white h-[46px] shadow-sm">
          <div className="flex items-center flex-1 px-3 border-r border-gray-200">
            <Search className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search near by salon" 
              className="w-full text-[13px] outline-none text-[#8D8D8D] placeholder-[#8D8D8D]"
            />
          </div>
          
          <div className="flex items-center px-4 border-r border-gray-200 cursor-pointer h-full hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
            <span className="text-[13px] text-[#8D8D8D] font-medium mr-1.5">Location</span>
            <ChevronDown  className="w-3.5 h-3.5 text-[#8D8D8D]" />
          </div>

          <div className="flex items-center px-4 cursor-pointer h-full hover:bg-gray-50 transition-colors mr-1">
            <Calendar className="w-4 h-4 text-[#8D8D8D] mr-2 flex-shrink-0" />
            <span className="text-[13px] text-[#8D8D8D] font-medium mr-1.5">Date</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8D8D8D]" />
          </div>

          <button className="bg-[#FF0B01] text-white text-[13px] font-bold tracking-widest px-6 h-full transition-opacity hover:opacity-90 uppercase flex-shrink-0">
            Search
          </button>
        </div>

        {/* Session Profiles / Control Triggers Block */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button className="flex items-center space-x-2 border border-[#909090] rounded-lg px-4 py-2 text-[#909090] hover:bg-gray-50 transition-colors text-[13px] font-semibold uppercase">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Signup</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-[#FF0B01] border border-[#909090] rounded-lg px-4 py-2 text-white hover:opacity-95 transition-opacity text-[13px] font-semibold uppercase">
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>

          <button className="lg:hidden p-2 text-[#909090] hover:text-black">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* --- MAIN PRODUCT ECOSYSTEM CANVAS --- */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-12 py-6 flex-1">
        
        {/* Breadcrumbs Navigation Route Map */}
        <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 font-medium mb-6">
          <span className="hover:underline cursor-pointer">Products Page</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-semibold">Products Description</span>
        </div>

        {/* Upper Dashboard Grid Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Column A: Primary Interactive Media Showcase Box */}
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] w-full border border-[#E8E8E8] rounded-lg bg-white flex items-center justify-center text-gray-300 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
                <img 
                  src={productOne} 
                  alt="Primary Product View" 
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>
          </div>

          {/* Column B: Right Side Commercial Advertisement Banner Units */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <div className="w-full h-[180px] bg-white rounded-lg border border-[#E8E8E8] flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src={productOne} 
                alt="Secondary Product View A" 
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="w-full h-[180px] bg-white rounded-lg border border-[#E8E8E8] flex items-center justify-center overflow-hidden shadow-sm">
              <img 
                src={productOne} 
                alt="Secondary Product View B" 
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
        </div>

        {/* Mid-Tier Grid Splitter: Core Buy Operations Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Main Context Summary Info Segment */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h1 className="text-[40px] font-semibold tracking-tight text-[#131313] leading-none mb-3">Nessaire</h1>
              <p className="text-[20px] font-medium text-[#8D8D8D] leading-relaxed max-w-3xl">
                The Body Lotion - Firming Moisturizer With 5 Peptides and 2.5% Niacinamide
              </p>
            </div>

            {/* Financials & Volume Quantities Selectors Layout Block */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-[28px] font-semibold text-[#131313]">₹450</span>
                <span className="text-[14px] font-bold text-[#8D8D8D] line-through decoration-[#868686]">₹999</span>
              </div>

              {/* Volume Specs Selector Controls */}
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
                <span className="text-[16px] font-semibold text-[#131313] mr-2">Qty -</span>
                <div className="flex items-center space-x-2">
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-1.5 text-[14px] font-medium rounded border transition-all ${
                        selectedSize === size
                          ? 'border-[#131313] bg-[#131313] text-white shadow-sm'
                          : 'border-gray-300 bg-white text-[#8D8D8D] hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Counter Widget Panel */}
              <div className="flex items-center space-x-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200 ml-auto sm:ml-0">
                <button 
                  onClick={decrementQty}
                  className="w-8 h-8 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="text-[18px] font-bold text-[#131313] min-w-[24px] text-center">{quantity}</span>
                <button 
                  onClick={incrementQty}
                  className="w-8 h-8 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* CTA Trigger Core Actions Row */}
            <div className="pt-4">
              <button 
                onClick={() => navigate('/customer/product-payment')}
                className="w-full sm:w-[220px] h-14 bg-[#FF0B01] hover:opacity-95 text-white font-bold text-[18px] tracking-wider rounded-lg shadow-md transition-opacity uppercase">
                BUY NOW
              </button>
            </div>
          </div>

          {/* Advert Content Sidebar Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="w-full h-[216px] bg-[#E8E8E8] rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-inner">
              <span className="text-[#FFF] font-medium text-[32px] tracking-widest uppercase font-mono drop-shadow-sm">ADVERTISEMENT</span>
            </div>
            
            <div className="w-full h-[216px] bg-[#E8E8E8] rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-inner">
              <span className="text-[#FFF] font-medium text-[32px] tracking-widest uppercase font-mono drop-shadow-sm">ADVERTISEMENT</span>
            </div>
          </div>
        </div>

        {/* --- DEEP DETAIL SCHEMATICS TABS CONTAINER --- */}
        <div className="border-t border-gray-100 pt-12 space-y-12 max-w-4xl">
          
          {/* Section segment 1: About */}
          <div className="space-y-3">
            <h3 className="text-[22px] font-semibold text-[#131313] tracking-wide">About</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed font-normal whitespace-pre-line text-justify">
              What it is: A daily, fragrance-free, multi-peptide lotion that intensely moisturizes, visibly firms, and supports strong skin.
              {"\n\n"}
              Highlighted Ingredients:
              {"\n"}- Niacinamide 2.5%: Supports a strong skin barrier.
              {"\n"}- Five Peptides: Visibly firm skin.
              {"\n"}- Lipid-Rich Plant Oils and Butters: Moisturize and infuse skin with nutrients.
              {"\n\n"}
              What Else You Need to Know: This daily, fragrance-free lotion visibly firms and strengthens skin while providing up to 48 hours of intensive moisture. The iconic, fast-absorbing formula has earned the National Eczema Association Seal of Approval and is dermatologist tested, non-comedogenic, and hypoallergenic.
            </p>
          </div>

          {/* Section segment 2: Ingredients */}
          <div className="space-y-3">
            <h3 className="text-[22px] font-semibold text-[#131313] tracking-wide">Ingredients</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed font-normal whitespace-pre-line text-justify">
              -5 Peptides: Firm the look of skin.
              {"\n"}-2.5% Niacinamide, 2 Fatty Acids: Visibly strengthen the skin barrier.
              {"\n"}-Cacay Oil, Marula Oil, Meadowfoam Oil: Infuses skin with vitamin A, C, E, F, Omega 6, and 9.
              {"\n\n"}
              Aqua/Water/Eau, Glycerin, Caprylic/Capric Triglyceride, Dicaprylyl Carbonate, Shea Butter Glycerides, Simmondsia Chinensis (Jojoba) Seed Oil, Niacinamide, Cetearyl Olivate, Cetearyl Alcohol, Glyceryl Stearate, Sorbitan Olivate, Palmitoyl Dipeptide-5 Diaminobutyroyl Hydroxythreonine, Palmitoyl Dipeptide-5 Diaminonhydroxybutyrate, Palmitoyl Hexapeptide-12, Palmitoyl Tetrapeptide-7, Palmitoyl Tripeptide-1, Sclerocarya Birrea Seed Oil, Caryodendron Orinocense Seed Oil, Limnanthes Alba (Meadowfoam) Seed Oil, Tocopherol, Linoleic Acid, Linolenic Acid, Propanediol, Polyacrylate, Crosspolymer-6, Caprylhydroxamic Acid, Caprylyl Glycol, T-Butyl Alcohol, Oleic Acid, Palmitic Acid, Stearic Acid.
              {"\n\n"}
              The list of ingredients is subject to change, please consult the packaging of the product purchased.
            </p>
          </div>

          {/* Section segment 3: How To Use */}
          <div className="space-y-3">
            <h3 className="text-[22px] font-semibold text-[#131313] tracking-wide">How To Use</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed font-normal whitespace-pre-line text-justify">
              Suggested Usage:
              {"\n"}-Use daily.
              {"\n"}-Apply all over your body, massaging until absorbed.
              {"\n"}-Pair with The Body Wash Fragrance-Free (sold separately) for an unscented experience.
              {"\n\n"}
              Recycling Instructions:
              {"\n"}-Nécessaire partners with How2Recycle to provide third-party-verified recycling claims.
              {"\n"}-Made from 100 percent bio-resin, the bottles are recyclable.
              {"\n"}-The carton and insert are made with FSC-certified, PCR kraft board.
              {"\n"}-The bottles and carton can be recycled curbside in the US and Canada.
            </p>
          </div>
        </div>

        {/* --- FULL SCREEN WIDTH RELATED PRODUCTS SECTION CONTAINER --- */}
        {/* Moved this section outside the max-w-4xl container to expand fully on screen like image_242e89.png */}
        <div className="border-t border-gray-100 pt-16 mt-16 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold uppercase tracking-wider text-[#131313]">Related Products</h2>
            <button className="text-[14px] font-semibold text-[#131313] hover:underline">
              See More
            </button>
          </div>

          {/* Scrollable container setup with exact card tracking controls */}
          <div className="relative group w-full">
            <div 
              ref={carouselRef}
              className="flex gap-7 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="min-w-[195px] max-w-[195px] flex flex-col justify-between snap-start">
                  
                  {/* Media Content Box Container Frame matched to image_242e89.png background tint */}
                  <div className="w-full aspect-[4/5] bg-[#E0E0E0] rounded-[22px] relative flex items-center justify-center p-3">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                    {/* Floating Badge Rating */}
                    <div className="absolute top-3.5 right-3.5 flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#FF9E0D] stroke-[#FF9E0D]" />
                      <span className="text-[11px] font-bold text-[#131313]">{prod.rating}</span>
                    </div>
                  </div>

                  {/* Metadata labels row info segments */}
                  <div className="mt-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-[13px] text-[#131313] font-medium tracking-tight leading-snug line-clamp-2 min-h-[38px]">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Financial value details layout wrapper formatting rows */}
                    <div className="flex items-center justify-between mt-3 text-[12px] font-semibold text-[#131313]">
                      <span>{prod.price}</span>
                      <span className="text-gray-400 font-normal">{prod.size}</span>
                    </div>

                    {/* Outer Border Box Action Trigger Buttons mapping */}
                    <button 
                      onClick={() => navigate('/customer/product-payment')}
                      className="w-full mt-4 h-10 text-[13px] font-bold text-[#131313] bg-white border border-[#131313] rounded-lg uppercase tracking-wider hover:bg-[#131313] hover:text-white transition-colors duration-200"
                    >
                      Buy Now
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Slider Next Right Pagination Arrow Controller */}
            <button 
              onClick={handleScrollRight}
              className="absolute right-[-20px] top-[32%] -translate-y-1/2 w-11 h-11 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
        
      </main>

      {/* --- BUSINESS DATA FOOTER MODULE --- */}
      <footer className="w-full bg-[#EAEAEA] border-t border-gray-300 pt-16 pb-8 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 items-start">
            {/* Branding Indicator Column */}
            <div className="flex items-center space-x-2">
              <div className="text-[#EF3E23] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clip-rule="evenodd" d="M50.8159 0.714844C51.5247 5.96652 50.2046 10.3104 46.635 13.7675C42.6288 17.6521 38.4736 21.3785 34.4058 25.1999C33.8973 25.6749 33.6303 25.7065 33.1526 25.1787C31.9918 23.8962 30.8002 22.6452 29.5573 21.4524C28.9769 20.8929 29.0797 20.6026 29.619 20.1117C36.0392 14.2584 42.4388 8.37867 48.8435 2.50418C49.4393 1.96054 50.0352 1.42739 50.821 0.720127L50.8159 0.714844Z" fill="#878787"/>
                  <path fillRule="evenodd" clip-rule="evenodd" d="M45.0678 28.1848C41.2002 25.7675 36.5264 25.7727 32.7513 28.1742C25.3244 20.6319 17.9181 13.079 10.5272 5.4997C8.79117 3.71044 7.13224 1.84204 5.43217 0C5.16509 0.30085 5.08808 0.343079 5.07781 0.401138C4.24062 5.43113 4.98529 10.0388 8.60628 13.8232C10.5015 15.8025 12.479 17.7026 14.4101 19.6449C17.0347 22.2734 19.6593 24.9019 22.2839 27.5303C25.2423 30.8766 27.9747 33.9643 30.8201 37.1786C31.1642 36.3183 31.3697 35.7113 31.6368 35.1413C33.5783 31.0508 38.4268 29.3302 42.4124 31.3042C45.2989 32.7346 47.1582 35.8222 46.9065 39.0418C46.6446 42.4303 44.9343 44.911 41.7961 46.1355C38.5655 47.3917 35.5146 46.7742 33.1519 44.1985C29.0327 39.7121 25.0934 35.0517 21.0256 30.5125C18.3702 27.541 14.9802 26.0947 11.0305 26.4694C5.66839 26.9814 1.59038 30.6549 0.337159 35.801C-0.859562 40.7149 1.19996 45.9825 5.39619 48.7271C9.84409 51.6406 15.119 51.461 19.4847 48.0884C20.5839 47.2333 21.3132 47.0592 22.0374 48.3207C22.0374 48.3207 26.3312 50.8964 29.3512 50.5533C26.1463 46.9062 23.1724 43.5282 20.0959 40.0183C19.7518 40.8997 19.5514 41.5225 19.2741 42.1031C17.3531 46.0617 12.8847 47.7453 8.87851 46.0405C5.05208 44.4096 3.09517 39.9233 4.47165 35.9225C6.44907 30.1378 13.8144 28.6071 18.0209 33.2043C22.0887 37.6431 25.946 42.2773 29.9984 46.732C33.229 50.2841 37.2917 51.5191 41.9348 50.3157C46.7679 49.0648 50.3323 45.0218 50.8356 40.2083C51.3749 35.041 49.4746 30.9347 45.0729 28.1848H45.0678ZM27.1375 28.8498C26.362 28.929 25.6121 28.1585 25.5915 27.3404C25.5813 26.5434 26.3208 25.7833 27.0964 25.7938C27.8874 25.8044 28.6424 26.5697 28.5757 27.3667C28.5038 28.2481 27.9799 28.7654 27.1375 28.8498Z" fill="#EF3E23"/>
                </svg>
              </div>
              <span className="text-[20px] font-bold tracking-tight text-[#242424]">NeoParlour</span>
            </div>

            {/* Link Stack Segment 1 */}
            <div>
              <h4 className="text-[16px] font-bold text-black uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-[14px] font-medium text-[#505050]">
                <li className="hover:text-black cursor-pointer transition-colors">• Influencer Program</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Careers</li>
                <li className="hover:text-black cursor-pointer transition-colors">• About Us</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Partner with us</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Buy gift card</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Blogs</li>
              </ul>
            </div>

            {/* Link Stack Segment 2 */}
            <div>
              <h4 className="text-[16px] font-bold text-black uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-[14px] font-medium text-[#505050]">
                <li className="hover:text-black cursor-pointer transition-colors">• Privacy Policy</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Terms of service</li>
              </ul>
            </div>

            {/* Link Stack Segment 3 */}
            <div>
              <h4 className="text-[16px] font-bold text-black uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-[14px] font-medium text-[#505050]">
                <li className="hover:text-black cursor-pointer transition-colors">• WhatsApp Support</li>
                <li className="hover:text-black cursor-pointer transition-colors">• Official Emails</li>
              </ul>
            </div>
          </div> 

          {/* Lower Copyright Ribbon Segment */}
          <div className="border-t border-gray-300 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-gray-500 tracking-wide">
            <p>© {new Date().getFullYear()} NeoSpaceInfotech.com. All Rights Reserved.</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <span className="hover:text-black cursor-pointer">Instagram</span>
              <span className="hover:text-black cursor-pointer">Facebook</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default ProductDetails;