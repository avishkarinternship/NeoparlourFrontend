/**
 * Universal helper function to translate any service or category name
 * using the current i18next translation function t.
 */
export const translateServiceName = (name, t) => {
    if (!name || typeof t !== 'function') return name || '';
    const nameLower = String(name).toLowerCase().trim();

    const keyMap = {
        'all': 'services.all',
        'hair services': 'services.hair_services',
        'hair': 'services.hair',
        'haircut': 'services.haircut',
        'hair cut': 'services.hair_cut',
        'hair styling': 'services.hair_styling',
        'hairstyling': 'services.hair_styling',
        'styling': 'services.hair_styling',
        'hair coloring': 'services.hair_coloring',
        'coloring': 'services.hair_coloring',
        'hair color': 'services.hair_color',
        'hair removal': 'services.hair_removal',
        'hairremoval': 'services.hair_removal',
        'waxing': 'services.waxing',
        'threading': 'services.threading',
        'hair spa': 'services.hair_spa',
        'hairspa': 'services.hair_spa',
        'hair treatment': 'services.hair_treatment',
        'hairtreatment': 'services.hair_treatment',
        'hair wash': 'services.hair_wash',
        'hairwash': 'services.hair_wash',
        'shampoo': 'services.shampoo',
        'nail care': 'services.nail_care',
        'nailcare': 'services.nail_care',
        'nails': 'services.nails',
        'nail': 'services.nails',
        'manicure': 'services.manicure',
        'pedicure': 'services.pedicure',
        'shaving': 'services.shaving',
        'beard': 'services.beard',
        'skin care': 'services.skin_care',
        'skincare': 'services.skincare',
        'skin': 'services.skin_care',
        'facial': 'services.facial',
        'clean up': 'services.clean_up',
        'cleanup': 'services.clean_up',
        'grooming': 'services.grooming',
        'makeup': 'services.makeup',
        'make up': 'services.makeup',
        'bridal packages': 'services.bridal_packages',
        'bridal': 'services.bridal_packages',
        'spa & massage': 'services.spa_massage',
        'spa and massage': 'services.spa_massage',
        'spa': 'services.spa',
        'massage': 'services.massage',
        'straightening': 'services.straightening',
        'straightning': 'services.straightening',
        'keratin': 'services.keratin',
        'blow dry': 'services.blow_dry',
        'bleach': 'services.bleach'
    };

    const key = keyMap[nameLower];
    if (key) {
        return t(key, name);
    }

    return name;
};
