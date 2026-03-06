package MangaAnimeTracker;

import javax.swing.*;
import javax.swing.border.TitledBorder;
import java.awt.*;

public class ListSection {
    private final JPanel panel;

    public ListSection(DefaultListModel<String> model, Runnable onBack) {
        panel = new JPanel(new BorderLayout());
        panel.setBackground(Color.decode("#0f172a"));

        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(Color.decode("#1e293b"));
        card.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(Color.decode("#334155")),
                "Your List",
                TitledBorder.LEFT, TitledBorder.TOP,
                new Font("SansSerif", Font.BOLD, 15), Color.WHITE
        ));

        JList<String> list = new JList<>(model);
        list.setBackground(Color.decode("#1e293b"));
        list.setForeground(Color.decode("#e2e8f0"));
        list.setFont(new Font("SansSerif", Font.PLAIN, 13));
        JScrollPane listScroll = new JScrollPane(list);
        listScroll.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        card.add(listScroll, BorderLayout.CENTER);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        actions.setBackground(Color.decode("#1e293b"));
        JButton btnRemove = new JButton("Remove Selected");
        btnRemove.setBackground(Color.decode("#1f2937"));
        btnRemove.setForeground(Color.BLACK);
        btnRemove.setFocusPainted(false);
        btnRemove.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnRemove.setMargin(new Insets(8, 16, 8, 16));
        JButton btnClear = new JButton("Clear All");
        btnClear.setBackground(Color.decode("#0b1220"));
        btnClear.setForeground(Color.BLACK);
        btnClear.setFocusPainted(false);
        btnClear.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnClear.setMargin(new Insets(8, 16, 8, 16));
        actions.add(btnRemove);
        actions.add(btnClear);
        card.add(actions, BorderLayout.SOUTH);

        JPanel outer = new JPanel(new BorderLayout());
        outer.setBackground(Color.decode("#0f172a"));
        outer.setBorder(BorderFactory.createEmptyBorder(24, 24, 24, 24));

        if (onBack != null) {
            JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
            top.setBackground(Color.decode("#0f172a"));
            JButton btnBack = new JButton("Back to Home");
            btnBack.setBackground(Color.decode("#334155"));
            btnBack.setForeground(Color.BLACK);
            btnBack.setFocusPainted(false);
            btnBack.setFont(new Font("SansSerif", Font.BOLD, 13));
            btnBack.setMargin(new Insets(6, 14, 6, 14));
            btnBack.addActionListener(e -> onBack.run());
            top.add(btnBack);
            outer.add(top, BorderLayout.NORTH);
        }

        outer.add(card, BorderLayout.CENTER);
        panel.add(outer, BorderLayout.CENTER);

        btnRemove.addActionListener(e -> {
            int index = list.getSelectedIndex();
            if (index >= 0) {
                model.remove(index);
            }
        });
        btnClear.addActionListener(e -> model.clear());
    }

    public JPanel getPanel() { return panel; }
}
