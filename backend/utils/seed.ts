import { User, Category, Service } from '../models';

export async function seedData() {
  const adminEmail = 'admin@servesmart.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ 
      email: adminEmail, 
      password: 'admin123', 
      displayName: 'System Admin', 
      role: 'admin', 
      isApproved: true 
    });
    await admin.save();
    console.log('Admin user created');
  } else {
    // Reset to fix potential double-hashing from previous versions
    admin.password = 'admin123';
    await admin.save();
  }

  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    const cats = [
      { name: 'Cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800' },
      { name: 'Plumbing', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
      { name: 'Salon', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800' },
      { name: 'Repairs', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800' },
      { name: 'Painting', image: 'https://images.unsplash.com/photo-1589939705384-5185138a0470?auto=format&fit=crop&q=80&w=800' },
      { name: 'Electrician', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
    ];
    await Category.insertMany(cats);
    console.log('Categories seeded');
  }

  const sCount = await Service.countDocuments();
  if (sCount === 0) {
    const providerEmail = 'provider@example.com';
    let p = await User.findOne({ email: providerEmail });
    if (!p) {
      p = new User({ 
        email: providerEmail, 
        password: 'password123', 
        displayName: 'Expert Home Services', 
        role: 'provider', 
        isApproved: true 
      });
      await p.save();
    } else {
      p.password = 'password123';
      await p.save();
    }
    const categories = await Category.find();
    if (categories.length > 0) {
      const sampleServices = [
        { 
          providerId: p._id, 
          categoryId: categories[0]._id, 
          name: 'Home Deep Cleaning', 
          description: 'Thorough cleaning of all rooms.', 
          price: 99, 
          duration: '4-5 hours', 
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800', 
          location: 'New York', 
          status: 'approved', 
          rating: 4.8, 
          reviewCount: 45 
        },
        { 
          providerId: p._id, 
          categoryId: categories[1]._id, 
          name: 'Emergency Plumbing Repair', 
          description: 'Fix leaks quickly.', 
          price: 50, 
          duration: '1-2 hours', 
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', 
          location: 'New York', 
          status: 'approved', 
          rating: 4.9, 
          reviewCount: 32 
        }
      ];
      await Service.insertMany(sampleServices);
    }
  }
}
