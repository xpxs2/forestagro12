{ pkgs, ... }:

{
  # Web preview for the Next.js app
  packages = [ pkgs.nodejs ];

  previews = {
    web = {
      port = 3000;
      command = "npm run dev";
    };
  };
}
