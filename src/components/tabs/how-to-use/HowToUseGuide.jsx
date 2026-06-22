import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  Banner,
  BannerContent,
  Text,
} from "@salt-ds/core";
import {
  GUIDE_SECTIONS,
  ASSISTANT_GUIDE,
  LIVE_SESSION_NOTICE,
} from "./guideContent.js";
import styles from "./HowToUseGuide.module.scss";

const HowToUseGuide = () => (
  <>
    <AccordionGroup>
      {GUIDE_SECTIONS.map(
        ({ id, title, description, controls, interactionTip }) => (
          <Accordion
            key={id}
            value={id}
            defaultExpanded={id === "overview" ? true : false}
          >
            <AccordionHeader>{title}</AccordionHeader>
            <AccordionPanel>
              <Text>{description}</Text>
              {controls.length > 0 && (
                <ul className={styles.list}>
                  {controls.map((control) => (
                    <li key={control}>{control}</li>
                  ))}
                </ul>
              )}
              {interactionTip && (
                <Banner status="info" className={styles.tip}>
                  <BannerContent>{interactionTip}</BannerContent>
                </Banner>
              )}
            </AccordionPanel>
          </Accordion>
        ),
      )}

      <Accordion value="assistant" defaultExpanded={false}>
        <AccordionHeader>AI Assistant</AccordionHeader>
        <AccordionPanel>
          <Text>{ASSISTANT_GUIDE.location}</Text>

          <Text styleAs="h4" className={styles.subheading}>
            What it can answer
          </Text>
          <ul className={styles.list}>
            {ASSISTANT_GUIDE.capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Text styleAs="h4" className={styles.subheading}>
            What to keep in mind
          </Text>
          <ul className={styles.list}>
            {ASSISTANT_GUIDE.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Text styleAs="h4" className={styles.subheading}>
            Requesting a two-driver telemetry report
          </Text>
          <ol className={styles.list}>
            {ASSISTANT_GUIDE.telemetryReportSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </AccordionPanel>
      </Accordion>
    </AccordionGroup>

    <Banner
      status="warning"
      variant="secondary"
      className={styles.liveSessionNotice}
    >
      <BannerContent>
        <Text styleAs="h4" className={styles.liveSessionNoticeHeading}>
          Heads up
        </Text>
        {LIVE_SESSION_NOTICE}
      </BannerContent>
    </Banner>
  </>
);

export default HowToUseGuide;
