import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { profile } from "@/data/profile";

const expertise = [
  "Brand Identity",
  "Illustration",
  "Editorial",
  "Visual Design",
  "Art Direction",
  "Motion",
];

const About = () => {
  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-3xl space-y-12">
          {/* Content */}
          <div>
            <h1 className="text-display mb-8 animate-fade-in-up">About</h1>

            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <p>
                <span className="text-foreground">Hi, I'm {profile.name}</span> — an independent
                artist and designer working across brand identity, illustration, and visual design.
              </p>
              <p>
                My approach combines minimalist aesthetics, authentic storytelling,
                and thoughtful design. Each project is an opportunity to explore
                stories through a unique visual language.
              </p>
              <p>
                I work on commercial, editorial, and personal projects, always
                seeking to create authentic narratives with visual depth.
              </p>
            </div>
          </div>

          {/* Expertise */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-label mb-6">Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {expertise.map((area) => (
                <span
                  key={area}
                  className="text-sm border border-border px-4 py-2"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Selected Work */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-label mb-4">Selected Work</h2>
            <p className="text-lg text-muted-foreground">
              A portfolio of projects is in progress —{" "}
              <Link to="/work" className="text-foreground link-underline">
                browse the current selection
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
