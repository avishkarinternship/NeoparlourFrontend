import re

filepath = r'c:\Users\athar\Downloads\NeoPace\NeoParlour_web\NeoparlourFrontend\src\components\Customer\SalonPage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Swap Top Experts and Opening Times

opening_times_start_tag = '{/* Opening Times */}'
opening_times_end_tag = '                        </section>'

top_experts_start_tag = '{/* ── Top Experts (Staff) ── */}'
top_experts_end_tag = '                        </section>'

# find start indices
ot_start = content.find(opening_times_start_tag)
te_start = content.find(top_experts_start_tag)

# find end indices
ot_end = content.find(opening_times_end_tag, ot_start) + len(opening_times_end_tag)
te_end = content.find(top_experts_end_tag, te_start) + len(top_experts_end_tag)

if ot_start != -1 and te_start != -1 and ot_start < te_start:
    opening_times_block = content[ot_start:ot_end]
    # change the grid from grid-cols-2 to grid-cols-1 inside opening times block
    opening_times_block = opening_times_block.replace('className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2"', 'className="flex flex-col gap-1.5 sm:gap-2"')
    
    top_experts_block = content[te_start:te_end]
    
    # recreate content by swapping
    new_content = content[:ot_start] + top_experts_block + '\n\n                        ' + opening_times_block + content[te_end:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Done swapping.")
else:
    print(f"Could not find blocks. ot_start={ot_start}, te_start={te_start}")
