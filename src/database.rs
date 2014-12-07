use std::kinds::marker;
use std::ptr;

use error::{LmdbResult, lmdb_result};
use ffi::{MDB_dbi, mdb_dbi_open};
use flags::DatabaseFlags;
use transaction::Transaction;

/// An LMDB database.
#[deriving(Copy)]
pub enum Database<'env> {

    /// A database which may contain at most one item per key.
    Uniq {
        dbi: MDB_dbi,
        _marker: marker::ContravariantLifetime<'env>,
    },
    /// A database which can contain multiple items per key.
    Dup {
        dbi: MDB_dbi,
        _marker: marker::ContravariantLifetime<'env>,
    }
}

impl <'env> Database<'env> {

    /// Opens a database in the given transaction. Prefer using `Transaction::open_uniq_db`.
    pub fn open_uniq(txn: &Transaction<'env>,
                     name: Option<&str>,
                     flags: DatabaseFlags)
                     -> LmdbResult<Database<'env>> {
        let c_name = name.map(|n| n.to_c_str());
        let name_ptr = if let Some(ref c_name) = c_name { c_name.as_ptr() } else { ptr::null() };
        let mut dbi: MDB_dbi = 0;
        unsafe {
            try!(lmdb_result(mdb_dbi_open(txn.txn(), name_ptr, flags.bits(), &mut dbi)));
        }
        Ok(Database::Uniq { dbi: dbi, _marker: marker::ContravariantLifetime::<'env> })
    }

    /// Opens a database with duplicate items in the given transaction. Prefer using
    /// `Transaction::open_dup_db`.
    #[doc(hidden)]
    pub fn open_dup(txn: &Transaction<'env>,
                    name: Option<&str>,
                    flags: DatabaseFlags)
                    -> LmdbResult<Database<'env>> {
        let c_name = name.map(|n| n.to_c_str());
        let name_ptr = if let Some(ref c_name) = c_name { c_name.as_ptr() } else { ptr::null() };
        let mut dbi: MDB_dbi = 0;
        unsafe {
            try!(lmdb_result(mdb_dbi_open(txn.txn(), name_ptr, flags.bits(), &mut dbi)));
        }
        Ok(Database::Dup { dbi: dbi, _marker: marker::ContravariantLifetime::<'env> })
    }

    /// Returns the underlying LMDB database handle.
    ///
    /// The caller **must** ensure that the handle is not used after the lifetime of the
    /// environment, or after the database handle has been closed.
    pub fn dbi(&self) -> MDB_dbi {
        match *self {
            Database::Uniq { dbi, .. } => dbi,
            Database::Dup { dbi, .. } => dbi,
        }
    }
}
