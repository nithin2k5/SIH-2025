// Export all model schemas
const StudentsSchema = require('./Students');
const AdmissionsSchema = require('./Admissions');
const UsersSchema = require('./Users');
const FeeMasterSchema = require('./FeeMaster');
const TransactionsSchema = require('./Transactions');
const ReceiptsSchema = require('./Receipts');
const HostelRoomsSchema = require('./HostelRooms');
const HostelAllocationsSchema = require('./HostelAllocations');
const CoursesSchema = require('./Courses');
const EnrollmentsSchema = require('./Enrollments');
const ExamsSchema = require('./Exams');
const MarksSchema = require('./Marks');
const LibraryItemsSchema = require('./LibraryItems');
const BorrowHistorySchema = require('./BorrowHistory');
const AuditLogSchema = require('./AuditLog');
const ConfigSchema = require('./Config');
const NotificationsSchema = require('./Notifications');
const FilesSchema = require('./Files');

module.exports = {
  Students: StudentsSchema,
  Admissions: AdmissionsSchema,
  Users: UsersSchema,
  FeeMaster: FeeMasterSchema,
  Transactions: TransactionsSchema,
  Receipts: ReceiptsSchema,
  HostelRooms: HostelRoomsSchema,
  HostelAllocations: HostelAllocationsSchema,
  Courses: CoursesSchema,
  Enrollments: EnrollmentsSchema,
  Exams: ExamsSchema,
  Marks: MarksSchema,
  LibraryItems: LibraryItemsSchema,
  BorrowHistory: BorrowHistorySchema,
  AuditLog: AuditLogSchema,
  Config: ConfigSchema,
  Notifications: NotificationsSchema,
  Files: FilesSchema
};
