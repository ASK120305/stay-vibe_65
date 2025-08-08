const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StayVibe Hotels. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
