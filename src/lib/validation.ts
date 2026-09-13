export interface FieldErrors {
  [field: string]: string;
}

export function validateProductName(
  name: string,
  existingNames: string[]
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Product name is required.";
  if (trimmed.length < 2) return "Product name is too short.";
  const duplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return "A product with this name already exists.";
  return null;
}

export function validateBillDraft(input: {
  partyName: string;
  items: { productNameSnapshot: string; quantity: number; rate: number; costPrice?: number }[];
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.partyName.trim()) errors.partyName = "Party name is required.";
  if (input.items.length === 0) {
    errors.items = "Add at least one product to the bill.";
  } else {
    input.items.forEach((item, idx) => {
      if (!item.productNameSnapshot.trim()) errors[`item-${idx}`] = "Select a product.";
      else if (item.quantity <= 0) errors[`item-${idx}`] = "Quantity must be greater than 0.";
      else if (item.rate < 0) errors[`item-${idx}`] = "Selling price cannot be negative.";
      else if (typeof item.costPrice === "number" && (Number.isNaN(item.costPrice) || item.costPrice < 0)) {
        errors[`item-${idx}`] = "Cost price must be a valid non-negative number.";
      }
    });
  }
  return errors;
}
