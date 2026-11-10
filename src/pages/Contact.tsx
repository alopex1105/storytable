import { Layout } from "@/components/Layout";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";
import { profile } from "@/data/profile";

const Contact = () => {
  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24 min-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-12">
            <div>
              <h1 className="text-display mb-6 animate-fade-in-up">
                Let's work<br />together.
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Interested in collaborating? Let's talk about your next project.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-4 text-lg hover-highlight group"
              >
                <Mail size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <span>{profile.email}</span>
              </a>

              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-lg hover-highlight group"
                >
                  <Instagram size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  <span>@{profile.instagram}</span>
                </a>
              )}

              {profile.phone && (
                <div className="flex items-center gap-4 text-lg text-muted-foreground">
                  <Phone size={20} />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            {/* Location */}
            {profile.location && (
              <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <p className="text-label mb-2">Based in</p>
                <p className="text-lg flex items-center gap-3">
                  <MapPin size={18} className="text-muted-foreground" />
                  {profile.location}
                </p>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="hidden lg:block">
            <div className="aspect-[4/5] bg-secondary overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=1000&fit=crop"
                alt="Contact"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
