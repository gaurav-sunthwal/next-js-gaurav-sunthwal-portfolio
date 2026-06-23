import React, { useState } from "react";
import { TestimonialItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, TextArea } from "@/components/Input";

interface ReviewsTabProps {
  testimonials: TestimonialItem[];
  loadData: () => Promise<void>;
}

export function ReviewsTab({ testimonials, loadData }: ReviewsTabProps) {
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setIsSaving(true);
    try {
      await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTestimonial),
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setEditingTestimonial(null);
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Partner Testimonials</h2>
        <Button variant="primary" onClick={() => setEditingTestimonial({})} className="flex items-center gap-2 border-none">
          <span className="material-symbols-outlined text-sm">add</span> Add Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((test, idx) => (
          <Card key={idx} interactive={false} className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col justify-between">
            <p className="text-xs text-on-surface-variant italic mb-6 leading-relaxed">"{test.quote}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-xs">{test.role}</h4>
                  <p className="text-[10px] text-on-surface-variant">{test.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingTestimonial(test)} className="px-3 py-1.5 text-xs">
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => deleteTestimonial((test as any).id)} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Testimonial Edit Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card interactive={false} className="w-full max-w-md bg-surface-container-lowest p-8 border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-title-md font-bold">
                {editingTestimonial.role ? "Edit Testimonial" : "Create New Testimonial"}
              </h3>
              <button onClick={() => setEditingTestimonial(null)} className="text-secondary hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={saveTestimonial} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Author Role"
                    required
                    value={editingTestimonial.role || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    placeholder="CTO"
                  />
                </div>
                <div>
                  <Input
                    label="Avatar Letter"
                    required
                    value={editingTestimonial.avatar || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value.substring(0,1).toUpperCase() })}
                    placeholder="T"
                  />
                </div>
              </div>
              <Input
                label="Company Name"
                required
                value={editingTestimonial.company || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                placeholder="Terminal 2"
              />
              <TextArea
                label="Quote Content"
                required
                value={editingTestimonial.quote || ""}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                placeholder="Write the review message here..."
              />
              <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                <Button type="button" variant="secondary" onClick={() => setEditingTestimonial(null)} className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="w-1/2 border-none">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
