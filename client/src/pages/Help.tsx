import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Help() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Help & FAQ</h2>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">About enterN | Ghost Tamer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            enterN is transforming the way we hire with the enterN platform. This is a 
            community-driven browser extension that allows jobseekers to report when employers 
            "ghost" them during the hiring process. By collecting and sharing these experiences, 
            we aim to bring transparency to the job market and help jobseekers make informed 
            decisions about applying.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-medium">
                What counts as "ghosting"?
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                Ghosting occurs when an employer abruptly cuts off communication during the 
                application process without providing any feedback or closure. This can happen 
                at any stage, from initial application to after final interviews.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-medium">
                How are company ratings calculated?
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                Ratings are based on the percentage of users who report ghosting experiences 
                with a company, as well as the severity (stage of the process). Later stage 
                ghosting is weighted more heavily in the overall score.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm font-medium">
                Is my information anonymous?
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                By default, all reports are anonymous. We never share your personal identity 
                with employers or other users. You can toggle this setting in the Settings page.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-sm font-medium">
                Which job boards are supported?
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                enterN | Ghost Tamer currently works with LinkedIn, Indeed, ZipRecruiter, and Monster. 
                We're always working to expand to more platforms. Let us know if you'd like 
                to see another site supported!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-sm font-medium">
                How can I report a problem?
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                If you encounter any issues with the extension, please email us at 
                support@entern.com or use the "Report Issue" button at the bottom 
                of this page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Have a question or feedback? We'd love to hear from you!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Issue
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
