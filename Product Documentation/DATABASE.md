# 🗄️ Firestore Database Design

## Collections

### users
- id
- name
- email
- role (user/admin)
- createdAt

### products
- id
- name
- categoryId
- price
- description
- image
- active

### categories
- id
- name

### orders
- id
- userId
- totalAmount
- status (pending, paid, failed)
- createdAt

### orderItems
- id
- orderId
- productId
- quantity
- price

### inventory
- id
- productId
- code (gift card / key)
- isUsed (true/false)

### transactions
- id
- orderId
- paymentMethod
- status
- transactionId