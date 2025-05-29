import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type EmailVerificationProps = {
  toName: string;
  code: string;
};

const EmailVerification = ({ toName, code }: EmailVerificationProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="m-8 text-center font-sans">
          <Container>
            <Section>
              <Text>
                Hello {toName}, please verify your email address by using the
                following code:
              </Text>
            </Section>
            <Section>
              <Text className="m-2 rounded bg-black p-2 text-white">
                {code}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmailVerification.PreviewProps = {
  toName: 'TK',
  code: 'OEKRNDWD',
} as EmailVerificationProps;

export default EmailVerification;
