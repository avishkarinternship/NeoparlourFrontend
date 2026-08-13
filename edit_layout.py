import re
import os

filepath = r'c:\Users\athar\Downloads\NeoPace\NeoParlour_web\NeoparlourFrontend\src\components\Customer\SalonPage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Group Opening Times and Top Experts
content = content.replace('{/* Opening Times */}', '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">\n                        {/* Opening Times */}')
content = content.replace('</section>\n\n                        {/* ── Quick Book', '</section>\n                        </div>\n\n                        {/* ── Quick Book')

# 2. Extract Products Grid
products_start = content.find('{/* Products Grid */}')
products_end = content.find('{/* Customer Reviews */}')
if products_start != -1 and products_end != -1:
    products_block = content[products_start:products_end]
    content = content[:products_start] + content[products_end:]
    # insert products block after Customer Reviews section
    reviews_end_str = '                        </section>\n\n                    </div>\n\n\n                </div>\n            </main>'
    reviews_end_idx = content.find(reviews_end_str)
    if reviews_end_idx != -1:
        content = content[:reviews_end_idx + 35] + '\n' + products_block + '\n' + content[reviews_end_idx + 35:]
    
# 3. Group Available Slots and Customer Reviews
content = content.replace('{/* ── Quick Book — Date & Time Slots ── */}', '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">\n                        {/* ── Quick Book — Date & Time Slots ── */}')
# close the div after Customer Reviews
content = content.replace('                        </section>\n\n                    </div>\n\n\n                </div>\n            </main>', '                        </section>\n                        </div>\n\n                    </div>\n\n\n                </div>\n            </main>')

# 4. Fix Top Experts grid to not overflow the 1/2 column (change sm:grid-cols-3 to sm:grid-cols-2)
content = content.replace('grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4', 'grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
