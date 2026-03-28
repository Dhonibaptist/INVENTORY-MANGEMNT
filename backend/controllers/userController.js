const User = require('../models/User');
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.updateUser = async (req, res) => {
  try {
    const { name, role, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role, phone, isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
