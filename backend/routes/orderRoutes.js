const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
const Product = require('../models/Product');
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, discount } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }
        const itemsPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const totalPrice = itemsPrice - (discount?.amount || 0);
        const order = new Order({
            user: req.user.id,
            orderItems: cart.items, 
            shippingAddress,
            paymentMethod,
            itemsPrice,
            totalPrice: totalPrice > 0 ? totalPrice : 0, 
            discount: discount ? { code: discount.code, amount: discount.amount } : undefined,
        });

        const createdOrder = await order.save();
        for (const item of createdOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            if (item.selectedVariant) { 
                const sku = product.variations
                    .flatMap(v => v.options.flatMap(o => o.skus))
                    .find(s => s._id.equals(item.selectedVariant));
                if (sku && sku.stock !== undefined) {
                    sku.stock -= item.quantity;
                }
            } else if (product.stock !== undefined) {
                product.stock -= item.quantity;
            }
            await product.save();
        }
        
        // حذف السلة بعد إنشاء الطلب
        await Cart.deleteOne({ user: req.user.id });
        
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});

router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/', protect, admin, async (req, res) => { 
    try { 
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 }); 
        res.json(orders); 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});
router.get('/:id', protect, async (req, res) => { 
    try { 
        const order = await Order.findById(req.params.id).populate('user', 'name email').lean();

        if (order) { 
            if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') { 
                return res.status(401).json({ message: 'Not authorized to view this order' }); 
            }

            const populatedOrderItems = await Promise.all(order.orderItems.map(async (item) => {
                const product = await Product.findById(item.product).lean();
                if (!product) {
                    return item;
                }
                if (item.selectedVariantId) {
                    let details = [];
                    product.variations.forEach(v => {
                        const opt = v.options.find(o => o.skus.some(s => s._id.equals(item.selectedVariantId)));
                        if (opt) {
                            details.push({
                                variationName: v.name,
                                optionName: opt.name   
                            });
                        }
                    });
                    return { ...item, dynamicVariantDetails: details };
                }
                return item; 
            }));
            
            res.json({ ...order, orderItems: populatedOrderItems }); 

        } else { 
            res.status(404).json({ message: 'Order not found' }); 
        } 
    } catch (e) { 
        console.error("Error fetching order details:", e)
        res.status(500).json({ message: 'Server Error' }); 
    } 
});
router.put('/:id/pay', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id || `ADMIN_PAID_${Date.now()}`,
                status: req.body.status || 'COMPLETED',
                update_time: req.body.update_time || new Date().toISOString(),
                email_address: req.body.email_address,
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});
router.put('/:id/deliver', protect, admin, async (req, res) => { 
    try { 
        const order = await Order.findById(req.params.id); 
        if (order) { 
            order.isDelivered = true; 
            order.deliveredAt = Date.now(); 
            const updatedOrder = await order.save(); 
            res.json(updatedOrder); 
        } else { 
            res.status(404).json({ message: 'Order not found' }); 
        } 
    } catch (e) { 
        res.status(500).json({ message: 'Server Error' }); 
    } 
});

module.exports = router;