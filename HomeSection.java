package MangaAnimeTracker;

import javax.swing.*;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.awt.AlphaComposite;
import java.awt.GradientPaint;
import java.awt.image.BufferedImage;

public class HomeSection {
    private JPanel panel;
    private final Runnable onAnime;
    private final Runnable onManga;
    private final Runnable onViewLists;

    public HomeSection() {
        this(null, null, null);
    }

    public HomeSection(Runnable onAnime, Runnable onManga, Runnable onViewLists) {
        this.onAnime = onAnime;
        this.onManga = onManga;
        this.onViewLists = onViewLists;
        panel = createBackgroundPanel(
                "C:\\Users\\Demi Elago\\IdeaProjects\\untitled\\src\\MangaAnimeTracker\\assets\\home_bg.jpg",
                Theme.BACKGROUND
        );
        panel.setLayout(new GridBagLayout());

        JPanel content = new JPanel();
        content.setOpaque(false);
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBorder(BorderFactory.createEmptyBorder(32, 32, 32, 32));

        JLabel logo = new JLabel(createScaledIcon(
                "C:\\Users\\Demi Elago\\IdeaProjects\\untitled\\src\\MangaAnimeTracker\\assets\\kiroku.png",
                220,
                220
        ));
        logo.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel title = new JLabel("Kiroku");
        title.setForeground(Theme.TEXT);
        title.setFont(new Font("SansSerif", Font.BOLD, 24));
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel subtitle = new JLabel("Track anime and manga with clean, simple lists.");
        subtitle.setForeground(Color.decode("#cbd5f5"));
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 13));
        subtitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        JPanel pill = createPillLabel("HOME");
        pill.setAlignmentX(Component.CENTER_ALIGNMENT);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.CENTER, 14, 0));
        actions.setOpaque(false);

        JButton addAnime = createPrimaryButton("Add Anime", Theme.ACCENT_BLUE, this.onAnime);
        JButton addManga = createPrimaryButton("Add Manga", Theme.ACCENT_RED, this.onManga);
        JButton viewAll = createPrimaryButton("View List", Theme.CARD, this.onViewLists);

        actions.add(addAnime);
        actions.add(addManga);
        actions.add(viewAll);

        content.add(logo);
        content.add(Box.createVerticalStrut(14));
        content.add(title);
        content.add(Box.createVerticalStrut(6));
        content.add(subtitle);
        content.add(Box.createVerticalStrut(14));
        content.add(pill);
        content.add(Box.createVerticalStrut(18));
        content.add(actions);

        panel.add(content);
    }

    private Icon createPlaceholderIcon(int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(Color.decode("#0f172a"));
        g2.fillRoundRect(0, 0, width, height, 12, 12);
        g2.setColor(Color.decode("#334155"));
        g2.drawRoundRect(0, 0, width - 1, height - 1, 12, 12);
        g2.setColor(Color.decode("#94a3b8"));
        g2.setFont(new Font("SansSerif", Font.PLAIN, 12));
        String text = "Image";
        FontMetrics fm = g2.getFontMetrics();
        int textX = (width - fm.stringWidth(text)) / 2;
        int textY = (height - fm.getHeight()) / 2 + fm.getAscent();
        g2.drawString(text, textX, textY);
        g2.dispose();
        return new ImageIcon(image);
    }

    private Icon createScaledIcon(String path, int maxWidth, int maxHeight) {
        ImageIcon rawIcon = new ImageIcon(path);
        if (rawIcon.getIconWidth() <= 0 || rawIcon.getIconHeight() <= 0) {
            return createPlaceholderIcon(maxWidth, maxHeight);
        }
        int srcW = rawIcon.getIconWidth();
        int srcH = rawIcon.getIconHeight();
        double scale = Math.min((double) maxWidth / srcW, (double) maxHeight / srcH);
        int targetW = Math.max(1, (int) Math.round(srcW * scale));
        int targetH = Math.max(1, (int) Math.round(srcH * scale));
        Image scaled = rawIcon.getImage().getScaledInstance(targetW, targetH, Image.SCALE_SMOOTH);
        return new ImageIcon(scaled);
    }

    private JPanel createPillLabel(String text) {
        RoundedPanel pill = new RoundedPanel(26, Theme.CARD);
        pill.setLayout(new GridBagLayout());
        pill.setBorder(BorderFactory.createEmptyBorder(6, 22, 6, 22));

        JLabel label = new JLabel(text);
        label.setForeground(Color.decode("#e2e8f0"));
        label.setFont(new Font("SansSerif", Font.BOLD, 12));
        pill.add(label);
        return pill;
    }

    private JButton createPrimaryButton(String text, Color background, Runnable action) {
        JButton button = new JButton(text);
        button.setBackground(background);
        button.setForeground(Color.decode("#0f172a"));
        button.setFocusPainted(false);
        button.setFont(new Font("SansSerif", Font.BOLD, 12));
        button.setMargin(new Insets(8, 18, 8, 18));
        button.addActionListener(e -> runAction(action));
        return button;
    }

    private JPanel createBackgroundPanel(String imagePath, Color fallback) {
        Image image = null;
        ImageIcon icon = new ImageIcon(imagePath);
        if (icon.getIconWidth() > 0 && icon.getIconHeight() > 0) {
            image = icon.getImage();
        }
        Image bgImage = image;
        JPanel background = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setColor(fallback);
                g2.fillRect(0, 0, getWidth(), getHeight());
                if (bgImage != null) {
                    g2.drawImage(bgImage, 0, 0, getWidth(), getHeight(), this);
                    g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.35f));
                    g2.setColor(fallback);
                    g2.fillRect(0, 0, getWidth(), getHeight());
                }
                g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.55f));
                GradientPaint gp = new GradientPaint(
                        0,
                        0,
                        Color.decode("#1e293b"),
                        0,
                        getHeight(),
                        Color.decode("#0f172a")
                );
                g2.setPaint(gp);
                g2.fillRect(0, 0, getWidth(), getHeight());
                g2.dispose();
            }
        };
        background.setBackground(fallback);
        return background;
    }

    private static class RoundedPanel extends JPanel {
        private final int arc;
        private final Color fill;

        private RoundedPanel(int arc, Color fill) {
            this.arc = arc;
            this.fill = fill;
            setOpaque(false);
        }

        @Override
        protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(fill);
            g2.fillRoundRect(0, 0, getWidth(), getHeight(), arc, arc);
            g2.dispose();
            super.paintComponent(g);
        }
    }

    public JPanel getPanel() { return panel; }

    private void runAction(Runnable action) {
        if (action != null) {
            action.run();
        }
    }
}
