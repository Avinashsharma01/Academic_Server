To reference both `User` and `Admin` in the `feedbackSchema`, you can use a **discriminator** or a **polymorphic reference**. However, the simplest and most common approach is to use a **conditional reference** where the `user` field can reference either a `User` or an `Admin` document. Here's how you can do it:

---

### **Updated Schema with Conditional Reference**

```javascript
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "userModel", // Dynamic reference based on the value of `userModel`
        },
        userModel: {
            type: String,
            required: true,
            enum: ["User", "Admin"], // Only allow "User" or "Admin" as values
        },
        message: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true }, // Rating (1 to 5 stars)
    },
    { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
```

---

### **Explanation**:

1. **`refPath`**:

    - The `refPath` option allows you to dynamically reference different models based on the value of another field (`userModel` in this case).
    - The `user` field will reference either the `User` or `Admin` model, depending on the value of `userModel`.

2. **`userModel` Field**:

    - This field specifies which model (`User` or `Admin`) the `user` field references.
    - The `enum` ensures that only `"User"` or `"Admin"` can be used as values.

3. **Flexibility**:
    - This approach allows you to store feedback from both `User` and `Admin` in the same collection.

---

### **Example Usage**:

#### **1. Saving Feedback from a User**

```javascript
const userFeedback = new Feedback({
    user: userId, // ID of the user
    userModel: "User", // Specify that this is a User
    message: "Great service!",
    rating: 5,
});

await userFeedback.save();
```

#### **2. Saving Feedback from an Admin**

```javascript
const adminFeedback = new Feedback({
    user: adminId, // ID of the admin
    userModel: "Admin", // Specify that this is an Admin
    message: "Good job!",
    rating: 4,
});

await adminFeedback.save();
```

---

### **Querying Feedback**:

When querying feedback, you can populate the `user` field dynamically based on the `userModel` value.

#### **Example Query**:

```javascript
const feedback = await Feedback.find().populate("user");

feedback.forEach((item) => {
    console.log(`Feedback from ${item.userModel}:`, item.user);
});
```

---

### **Alternative: Polymorphic Reference**

If you want to avoid adding an extra field (`userModel`), you can use a **polymorphic reference**. However, this approach is more complex and less common in Mongoose. Here's an example:

```javascript
const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: function () {
                return this.userType; // Dynamic reference based on `userType`
            },
        },
        userType: {
            type: String,
            required: true,
            enum: ["User", "Admin"],
        },
        message: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
    },
    { timestamps: true }
);
```

---

### **Which Approach to Use?**

-   **Conditional Reference (`refPath`)**: This is the recommended approach because it is straightforward and well-supported by Mongoose.
-   **Polymorphic Reference**: Use this only if you have a specific reason to avoid adding an extra field.

---

### **Final Notes**:

-   Ensure that both `User` and `Admin` models exist in your Mongoose setup.
-   When populating the `user` field, Mongoose will automatically use the correct model based on the `userModel` field.
