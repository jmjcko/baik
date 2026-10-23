# Regression Report 2026-10-23

**QA**: AIRE_QA
**Scope**: whole suite after Epic 22

Whole suite 1390/1390. Existing behavior touched: `StockSelection` (new `community` source) in the parser, `resolveStockBike`, the audit badge, the picker (`useStockBikePicker` takes the merged list; the review card shared as `ReviewBoxes`), `Sidebar` (admin link), the profile (export and erase), `fakeDatabase` (catalog tables, rpc results). Two existing tests were adapted: the account deletion error test now targets `delete_my_account` (the admin check also calls rpc) and the export test expects `sharedBikes`. The translation fixture gained lines only.
