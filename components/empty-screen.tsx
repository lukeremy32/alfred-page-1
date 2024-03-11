import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { IconArrowRight } from '@/components/ui/icons';

const exampleMessages = [
  {
    heading: 'What are the latest releases from the CFPB?',
    message: 'Get the most recent Federal Register docs for the CFPB',
  },
  {
    heading: "How has the homeownership rate changed during Biden's term?",
    message: "How has the homeownership rate changed during Biden's presidency?",
  },
  {
    heading: "What are this week's releases from Federal agencies?",
    message: "What are this week's releases from Federal agencies?",
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          Ask ALFReD!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
        Know Better...
        </p>
        <p className="mb-2 leading-normal text-muted-foreground">
          ALFReD is brought to you by Impact Capitol and Group AI with{' '}
          <ExternalLink href="https://impactcapitoldc.com">Impact Capitol</ExternalLink> and {' '}
          <ExternalLink href="https://thegroup.ai">
            Group AI
          </ExternalLink>
          .
          
        </p>
        <p className="leading-normal text-muted-foreground">Try an example:</p>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
      <p className="leading-normal text-muted-foreground text-[0.8rem] text-center max-w-96 ml-auto mr-auto">
        Note: Use best judgment when asking ALFReD for predictions of advice.
      </p>
    </div>
  );
}
