import React from "react";
import { Building2, FileText, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BusinessSectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
}

const BusinessSection = ({
  title = "Enterprise Solutions for Your Business",
  description = "Xeption Network provides tailored technology solutions for businesses of all sizes. From hardware procurement to IT infrastructure setup, we help your business stay ahead in the digital landscape.",
  ctaText = "Request a Quote",
}: BusinessSectionProps) => {
  return (
    <section className="w-full py-12 bg-black text-white" id="business-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gold">{title}</h2>
            <p className="mb-6 text-gray-300">{description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3">
                <Building2 className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gold">
                    Corporate Accounts
                  </h3>
                  <p className="text-sm text-gray-400">
                    Special pricing and dedicated support for businesses
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gold">RFQ Process</h3>
                  <p className="text-sm text-gray-400">
                    Submit requests for quotes for bulk orders
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gold">Team Solutions</h3>
                  <p className="text-sm text-gray-400">
                    Equipment for your entire workforce
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BarChart className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gold">
                    Business Analytics
                  </h3>
                  <p className="text-sm text-gray-400">
                    Technology to drive your business decisions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-center text-gold">
              Request Business Quote
            </h3>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Company Name
                </label>
                <Input
                  id="company"
                  placeholder="Your Company Name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Contact Person
                </label>
                <Input
                  id="contact"
                  placeholder="Full Name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    placeholder="+237 6XX XXX XXX"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Business Requirements
                </label>
                <Textarea
                  id="requirements"
                  placeholder="Tell us about your business needs..."
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {ctaText}
              </Button>

              <p className="text-xs text-center text-gray-400 mt-2">
                A Xeption Network representative will contact you within 24
                hours
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
