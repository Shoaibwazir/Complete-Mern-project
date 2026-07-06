// Product Templates for different categories
export const productTemplates = {
  // Women's Traditional Dresses Template
  womenTraditional: {
    description: `✨ Exquisite Traditional Afghan Dress featuring intricate embroidery and premium quality fabric.

✨ PRODUCT DETAILS:
• Brand: QASR-E-LIBAS LTD
• Origin: Afghanistan
• Material: Premium Quality Fabric
• Style: Traditional Afghan Dress
• Sleeve length: Full Sleeve
• Care: Dry clean only

✨ FEATURES:
• Handcrafted with attention to detail
• Traditional embroidery
• Perfect for weddings and special occasions
• Premium quality fabric
• Comfortable fit

✨ CARE INSTRUCTIONS:
• Dry clean only
• Store in a cool, dry place
• Avoid direct sunlight`,
    careInstructions: "Dry clean only. Store in a cool, dry place. Avoid direct sunlight.",
    material: "Premium Fabric",
    brand: "QASR-E-LIBAS LTD",
    origin: "Afghanistan",
    style: "Traditional Afghan Dress",
    sleeveLength: "Full Sleeve",
    returnPolicy: "14-day return policy",
    sizingInfo: "True to size. See size chart for details."
  },

  // Men's Traditional Template
  menTraditional: {
    description: `✨ Premium Men's Traditional Afghan Wear with elegant design and comfortable fit.

✨ PRODUCT DETAILS:
• Brand: QASR-E-LIBAS LTD
• Origin: Afghanistan
• Material: Premium Quality Fabric
• Style: Traditional Afghan Wear
• Care: Dry clean only

✨ FEATURES:
• Handcrafted quality
• Traditional design
• Perfect for formal occasions
• Breathable fabric

✨ CARE INSTRUCTIONS:
• Dry clean recommended
• Store in cool, dry place`,
    careInstructions: "Dry clean recommended. Store in cool, dry place.",
    material: "Premium Fabric",
    brand: "QASR-E-LIBAS LTD",
    origin: "Afghanistan",
    style: "Traditional Afghan Wear",
    sleeveLength: "Full Sleeve"
  },

  // Jewelry Template
  jewelry: {
    description: `✨ Exquisite handcrafted jewelry piece from Afghanistan.

✨ PRODUCT DETAILS:
• Brand: QASR-E-LIBAS LTD
• Origin: Afghanistan
• Material: Premium quality
• Style: Traditional Afghan Jewelry

✨ FEATURES:
• Handcrafted
• Authentic design
• Perfect for weddings and special occasions

✨ CARE INSTRUCTIONS:
• Store in jewelry box
• Avoid contact with chemicals
• Clean with soft cloth`,
    careInstructions: "Store in jewelry box. Avoid contact with chemicals. Clean with soft cloth.",
    material: "Premium Metal",
    brand: "QASR-E-LIBAS LTD",
    origin: "Afghanistan",
    style: "Traditional Jewelry"
  },

  // Shoes Template
  shoes: {
    description: `✨ Premium quality traditional footwear with comfortable fit.

✨ PRODUCT DETAILS:
• Brand: QASR-E-LIBAS LTD
• Material: Premium Leather/Fabric
• Style: Traditional Footwear

✨ FEATURES:
• Comfortable fit
• Durable sole
• Traditional design

✨ CARE INSTRUCTIONS:
• Clean with damp cloth
• Air dry only
• Use shoe polish for leather`,
    careInstructions: "Clean with damp cloth. Air dry only.",
    material: "Premium Leather",
    brand: "QASR-E-LIBAS LTD",
    style: "Traditional Footwear"
  },

  // Accessories Template
  accessories: {
    description: `✨ Beautiful traditional accessory to complete your look.

✨ PRODUCT DETAILS:
• Brand: QASR-E-LIBAS LTD
• Origin: Afghanistan
• Material: Premium quality

✨ FEATURES:
• Handcrafted
• Traditional design
• Perfect gift item

✨ CARE INSTRUCTIONS:
• Handle with care
• Store safely`,
    careInstructions: "Handle with care. Store safely.",
    material: "Premium Material",
    brand: "QASR-E-LIBAS LTD",
    origin: "Afghanistan"
  }
};

// Common policies (shared across all products)
export const commonPolicies = {
  returnPolicy: "We offer a 14-day return policy on all unused items in original packaging. Customer is responsible for return shipping unless item is defective.",
  shippingInfo: "Orders are processed within 1-2 business days. Standard shipping takes 3-5 business days.",
  warrantyInfo: "6-month warranty against manufacturing defects.",
  sizeGuide: "See size chart below for accurate measurements."
};

// ✅ ADD THIS - Export sizingCharts
export const sizingCharts = {
  'women-dress': {
    name: "Women's Dress Size Chart",
    description: "Standard women's dress measurements",
    chart: `
      <table class="size-chart-table">
        <thead>
          <tr><th>Size</th><th>Bust (inches)</th><th>Waist (inches)</th><th>Hips (inches)</th><th>UK Size</th></tr>
        </thead>
        <tbody>
          <tr><td>XS</td><td>30-32</td><td>24-26</td><td>33-35</td><td>6-8</td></tr>
          <tr><td>S</td><td>33-35</td><td>27-29</td><td>36-38</td><td>8-10</td></tr>
          <tr><td>M</td><td>36-38</td><td>30-32</td><td>39-41</td><td>10-12</td></tr>
          <tr><td>L</td><td>39-41</td><td>33-35</td><td>42-44</td><td>12-14</td></tr>
          <tr><td>XL</td><td>42-44</td><td>36-38</td><td>45-47</td><td>14-16</td></tr>
        </tbody>
      </table>
    `
  },
  'men-clothing': {
    name: "Men's Clothing Size Chart",
    description: "Standard men's clothing measurements",
    chart: `
      <table class="size-chart-table">
        <thead>
          <tr><th>Size</th><th>Chest (inches)</th><th>Waist (inches)</th><th>Neck (inches)</th><th>Sleeve (inches)</th></tr>
        </thead>
        <tbody>
          <tr><td>S</td><td>34-36</td><td>28-30</td><td>14-14.5</td><td>32-33</td></tr>
          <tr><td>M</td><td>38-40</td><td>32-34</td><td>15-15.5</td><td>33-34</td></tr>
          <tr><td>L</td><td>42-44</td><td>36-38</td><td>16-16.5</td><td>34-35</td></tr>
          <tr><td>XL</td><td>46-48</td><td>40-42</td><td>17-17.5</td><td>35-36</td></tr>
          <tr><td>XXL</td><td>50-52</td><td>44-46</td><td>18-18.5</td><td>36-37</td></tr>
        </tbody>
      </table>
    `
  },
  'jewelry': {
    name: "Jewelry Size Guide",
    description: "Ring sizes and necklace lengths",
    chart: `
      <div class="jewelry-size-guide">
        <h4>Ring Size Chart</h4>
        <table class="size-chart-table">
          <thead><tr><th>US Size</th><th>UK Size</th><th>Diameter (mm)</th><th>Circumference (mm)</th></tr></thead>
          <tbody>
            <tr><td>5</td><td>J</td><td>15.7</td><td>49.3</td></tr>
            <tr><td>6</td><td>L</td><td>16.5</td><td>51.8</td></tr>
            <tr><td>7</td><td>N</td><td>17.3</td><td>54.4</td></tr>
            <tr><td>8</td><td>P</td><td>18.2</td><td>57.2</td></tr>
          </tbody>
        </table>
        <h4>Necklace Lengths</h4>
        <ul>
          <li><strong>16"</strong> - Choker style, sits at base of neck</li>
          <li><strong>18"</strong> - Princess length, sits on collarbone</li>
          <li><strong>20"</strong> - Matinee length, sits above bust</li>
          <li><strong>24"</strong> - Opera length, sits below bust</li>
        </ul>
      </div>
    `
  },
  'shoes': {
    name: "Shoe Size Chart",
    description: "UK/EU/US size conversion",
    chart: `
      <table class="size-chart-table">
        <thead>
          <tr><th>UK Size</th><th>EU Size</th><th>US Size</th><th>Foot Length (cm)</th></tr>
        </thead>
        <tbody>
          <tr><td>3</td><td>36</td><td>5</td><td>22.5</td></tr>
          <tr><td>4</td><td>37</td><td>6</td><td>23.0</td></tr>
          <tr><td>5</td><td>38</td><td>7</td><td>23.5</td></tr>
          <tr><td>6</td><td>39</td><td>8</td><td>24.0</td></tr>
          <tr><td>7</td><td>40</td><td>9</td><td>24.5</td></tr>
        </tbody>
      </table>
    `
  },
  'universal': {
    name: "Universal Size Chart",
    description: "General size guide for all products",
    chart: `
      <table class="size-chart-table">
        <thead>
          <tr><th>Size</th><th>Bust (inches)</th><th>Waist (inches)</th><th>Hips (inches)</th></tr>
        </thead>
        <tbody>
          <tr><td>XS</td><td>31-33</td><td>23-25</td><td>33-35</td></tr>
          <tr><td>S</td><td>34-36</td><td>26-28</td><td>36-38</td></tr>
          <tr><td>M</td><td>37-39</td><td>29-31</td><td>39-41</td></tr>
          <tr><td>L</td><td>40-42</td><td>32-34</td><td>42-44</td></tr>
          <tr><td>XL</td><td>43-45</td><td>35-37</td><td>45-47</td></tr>
        </tbody>
      </table>
    `
  }
};