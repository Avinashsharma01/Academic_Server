The issue is that **the `subject` field is case-sensitive** in MongoDB by default. Unlike regex searches, direct equality checks in MongoDB (`filter.subject = subject;`) are **case-sensitive**.

### **How to Fix It?**

You need to make the subject search case-insensitive by using **a regex match** or a **collation**.

---

### **Solution 1: Use Regex for Case-Insensitive Subject Match**

Modify your query like this:

```js
export const searchNotes = async (req, res) => {
    try {
        const { query, subject } = req.query;

        let filter = {};

        // Case-insensitive title/description search
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ];
        }

        // Case-insensitive subject search
        if (subject) {
            filter.subject = { $regex: `^${subject}$`, $options: "i" };
        }

        const notes = await Note.find(filter);
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
```

### ✅ What This Does:

-   `subject: { $regex: `^${subject}$`, $options: "i" }`
    -   The `^` and `$` ensure **an exact match** but in a **case-insensitive** way.
    -   So, searching `"english"` will match `"English"`, `"ENGLISH"`, `"eNgLiSh"`, etc.

---

### **Solution 2: Use MongoDB Collation (Better for Indexed Fields)**

If your `subject` field is indexed, regex might be slow. Instead, use MongoDB **collation**:

```js
const notes = await Note.find(filter).collation({ locale: "en", strength: 2 });
```

Modify your code like this:

```js
export const searchNotes = async (req, res) => {
    try {
        const { query, subject } = req.query;

        let filter = {};

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ];
        }

        if (subject) {
            filter.subject = subject;
        }

        const notes = await Note.find(filter).collation({
            locale: "en",
            strength: 2,
        }); // Case-insensitive search
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
```

### ✅ Why This is Better:

-   **Works on indexed fields** without slowing down queries.
-   **More efficient than regex** for exact matches.
-   `"english"`, `"English"`, and `"ENGLISH"` will all match the same way.

---

### **Which One Should You Use?**

| Approach                                                   | Pros                     | Cons                      |
| ---------------------------------------------------------- | ------------------------ | ------------------------- |
| **Regex (`$regex`)**                                       | Simple, flexible         | Slower for large datasets |
| **Collation (`collation({ locale: "en", strength: 2 })`)** | Fast, works with indexes | Requires MongoDB 3.4+     |

If your `subject` field is indexed, **Solution 2 (collation)** is the best. Otherwise, Solution 1 (regex) works fine.

Let me know if you need more help! 🚀
