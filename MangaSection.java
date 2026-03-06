package MangaAnimeTracker;

import javax.swing.*;
import javax.swing.border.TitledBorder;
import java.awt.*;

public class MangaSection {
    private JPanel panel;
    private JTextField txtTitle;
    private JComboBox<String> cmbStatus;
    private JSpinner spnProgress;
    private JSpinner spnRating;
    private final DefaultListModel<String> model;
    private final Runnable onBack;

    public MangaSection() {
        this(new DefaultListModel<>(), null);
    }

    public MangaSection(DefaultListModel<String> model, Runnable onBack) {
        this.model = model;
        this.onBack = onBack;
        panel = new JPanel(new BorderLayout());
        panel.setBackground(Color.decode("#0f172a"));

        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBackground(Color.decode("#1e293b"));
        card.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(Color.decode("#ef4444")),
                "Add New Manga",
                TitledBorder.LEFT, TitledBorder.TOP,
                new Font("SansSerif", Font.BOLD, 15), Color.WHITE
        ));

        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(Color.decode("#1e293b"));
        form.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        gbc.anchor = GridBagConstraints.WEST;

        JLabel lblTitle = new JLabel("Manga Title:");
        lblTitle.setForeground(Color.WHITE);
        lblTitle.setFont(new Font("SansSerif", Font.PLAIN, 13));

        txtTitle = new JTextField(24);
        txtTitle.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JLabel lblStatus = new JLabel("Status:");
        lblStatus.setForeground(Color.WHITE);
        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 13));

        cmbStatus = new JComboBox<>(new String[]{"Ongoing", "Completed", "Hiatus"});
        cmbStatus.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JLabel lblProgress = new JLabel("Current Chapter:");
        lblProgress.setForeground(Color.WHITE);
        lblProgress.setFont(new Font("SansSerif", Font.PLAIN, 13));

        spnProgress = new JSpinner(new SpinnerNumberModel(1, 1, 100000, 1));
        spnProgress.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JLabel lblRating = new JLabel("Rating (0-10):");
        lblRating.setForeground(Color.WHITE);
        lblRating.setFont(new Font("SansSerif", Font.PLAIN, 13));

        spnRating = new JSpinner(new SpinnerNumberModel(0, 0, 10, 1));
        spnRating.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JButton btnAdd = new JButton("Add to List");
        btnAdd.setBackground(Color.decode("#ef4444"));
        btnAdd.setForeground(Color.BLACK);
        btnAdd.setFocusPainted(false);
        btnAdd.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnAdd.setMargin(new Insets(8, 16, 8, 16));

        JButton btnClear = new JButton("Clear");
        btnClear.setBackground(Color.decode("#0b1220"));
        btnClear.setForeground(Color.BLACK);
        btnClear.setFocusPainted(false);
        btnClear.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnClear.setMargin(new Insets(8, 16, 8, 16));

        gbc.gridx = 0;
        gbc.gridy = 0;
        form.add(lblTitle, gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        form.add(txtTitle, gbc);

        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.fill = GridBagConstraints.NONE;
        form.add(lblStatus, gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        form.add(cmbStatus, gbc);

        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.fill = GridBagConstraints.NONE;
        form.add(lblProgress, gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        form.add(spnProgress, gbc);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.fill = GridBagConstraints.NONE;
        form.add(lblRating, gbc);

        gbc.gridx = 1;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        form.add(spnRating, gbc);

        gbc.gridx = 0;
        gbc.gridy = 4;
        gbc.gridwidth = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        actions.setBackground(Color.decode("#1e293b"));
        actions.add(btnAdd);
        actions.add(btnClear);
        form.add(actions, gbc);
        card.add(form);

        JPanel outer = new JPanel(new BorderLayout());
        outer.setBackground(Color.decode("#0f172a"));
        outer.setBorder(BorderFactory.createEmptyBorder(24, 24, 24, 24));
        outer.add(card, BorderLayout.CENTER);

        if (this.onBack != null) {
            JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
            top.setBackground(Color.decode("#0f172a"));
            JButton btnBack = new JButton("Back to Home");
            btnBack.setBackground(Color.decode("#334155"));
            btnBack.setForeground(Color.BLACK);
            btnBack.setFocusPainted(false);
            btnBack.setFont(new Font("SansSerif", Font.BOLD, 13));
            btnBack.setMargin(new Insets(6, 14, 6, 14));
            btnBack.addActionListener(e -> this.onBack.run());
            top.add(btnBack);
            outer.add(top, BorderLayout.NORTH);
        }

        panel.add(outer, BorderLayout.CENTER);

        btnAdd.addActionListener(e -> addEntry());
        btnClear.addActionListener(e -> clearForm());
    }

    public JPanel getPanel() { return panel; }

    private void addEntry() {
        String title = txtTitle.getText().trim();
        if (title.isEmpty()) {
            JOptionPane.showMessageDialog(panel, "Please enter a manga title.", "Missing Title", JOptionPane.WARNING_MESSAGE);
            return;
        }
        String status = (String) cmbStatus.getSelectedItem();
        int progress = (Integer) spnProgress.getValue();
        int rating = (Integer) spnRating.getValue();
        model.addElement("Manga • " + title + " • " + status + " • Ch " + progress + " • " + rating + "/10");
        clearForm();
    }

    private void clearForm() {
        txtTitle.setText("");
        cmbStatus.setSelectedIndex(0);
        spnProgress.setValue(1);
        spnRating.setValue(0);
    }
}