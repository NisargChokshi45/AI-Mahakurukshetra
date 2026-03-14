# Pull Request

## 📌 Summary

Provide a clear and concise description of the changes in this PR.

- What problem does this solve?
- What functionality or improvement is introduced?
- Why was this change necessary?

Example:
> Adds server action for creating job applications and persists them to Supabase.

---

## 🔗 Related Issue / Ticket

Closes: #<!-- e.g. Closes: #42 -->
Related: #<!-- e.g. Related: #38 -->

---

## 🧠 Type of Change

Select all that apply.

- [ ] ✨ New Feature
- [ ] 🐛 Bug Fix
- [ ] ♻️ Refactor
- [ ] ⚡ Performance Improvement
- [ ] 🧪 Tests Added / Updated
- [ ] 📝 Documentation Update
- [ ] 🔧 DevOps / CI Changes
- [ ] 🗄 Database / Supabase Schema Change
- [ ] 💥 Breaking Change

---

## 📝 Changes Implemented

Describe the technical changes introduced in this PR.

- Added new API route / server action
- Updated Next.js component logic
- Modified Supabase query or schema
- Added validation or error handling
- Updated environment configuration

---

## 🗄 Supabase Changes (if applicable)

If this PR affects the database.

- [ ] Migration Added
- [ ] Schema Updated
- [ ] New Table
- [ ] Updated RLS Policies
- [ ] Updated Supabase Functions
- [ ] No Database Changes

Migration / SQL summary:

```sql
-- Example
alter table applications
add column status text default 'pending';
```

---

## ⚠️ Breaking Changes

Describe any breaking changes.

Examples:

* API response structure changed
* Removed deprecated endpoint
* Database schema modifications requiring migration

If none:

```
None
```

---

## 🔐 Security Considerations

Confirm the following:

* [ ] RLS policies reviewed/updated
* [ ] No secrets or tokens committed
* [ ] Environment variables handled correctly
* [ ] API routes validate inputs
* [ ] Sensitive data not exposed to client

Notes:

```
Example: Ensured Supabase service role key is used only on server-side.
```

---

## 🧪 Testing

How were these changes tested?

* [ ] Unit Tests
* [ ] Integration Tests
* [ ] Manual Testing
* [ ] Existing Tests Passing

Manual test steps:

1. Run the app locally
2. Create a new application
3. Verify record appears in Supabase
4. Verify UI updates correctly

---

## 📸 Screenshots / UI Changes (if applicable)

Add screenshots or recordings for UI changes.

Example:

## Before:

## After:

---

## ⚡ Performance Impact

Does this change affect performance?

* [ ] No impact
* [ ] Improves performance
* [ ] Potential performance impact

Notes:

```
Example: Reduced duplicate Supabase queries by caching server response.
```

---

## 🚀 Deployment Notes

Anything reviewers or DevOps should know before deploying.

* [ ] Requires database migration
* [ ] Requires new environment variables
* [ ] Requires Supabase configuration change
* [ ] Requires Vercel project configuration update
* [ ] No special deployment steps

Details:

```
Example:
Add the following env variable to Vercel:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🔄 Rollback Strategy

If something goes wrong in production, how can this change be reverted?

Example:

* Revert this PR
* Roll back Supabase migration
* Redeploy previous Vercel build

---

## 📋 Checklist

Before requesting review, confirm:

* [ ] Code follows project conventions
* [ ] Self-review completed
* [ ] No unnecessary logs or debug code
* [ ] Types are correctly defined
* [ ] Edge cases handled
* [ ] Documentation updated (if needed)
* [ ] Database migrations included (if required)
* [ ] Vercel environment variables verified

---

## 👀 Reviewer Notes

Anything reviewers should pay special attention to.

Example:

* Review Supabase RLS policy for `applications` table
* Validate server action error handling