package MangaAnimeTracker;

import javax.swing.*;
import java.awt.*;

public class Main {
    public Main() {
        try { UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName()); } catch (Exception e) {}

        JFrame frame = new JFrame("Kiroku - Anime & Manga Tracker");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(640, 720);
        frame.setLocationRelativeTo(null);
        frame.getContentPane().setBackground(Theme.BACKGROUND);

        CardLayout cards = new CardLayout();
        JPanel content = new JPanel(cards);
        content.setBackground(Theme.BACKGROUND);

        DefaultListModel<String> listModel = new DefaultListModel<>();

        // Navigation callbacks
        HomeSection home = new HomeSection(
                () -> cards.show(content, "anime"),
                () -> cards.show(content, "manga"),
                () -> cards.show(content, "lists")
        );
        AnimeSection anime = new AnimeSection(listModel, () -> cards.show(content, "home"));
        MangaSection manga = new MangaSection(listModel, () -> cards.show(content, "home"));
        ListSection lists = new ListSection(listModel, () -> cards.show(content, "home"));

        content.add(home.getPanel(), "home");
        content.add(anime.getPanel(), "anime");
        content.add(manga.getPanel(), "manga");
        content.add(lists.getPanel(), "lists");

        cards.show(content, "home");
        frame.add(content);
        frame.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(Main::new);
    }
}